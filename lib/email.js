import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM    = process.env.EMAIL_FROM     || "onboarding@resend.dev";
const REPLYTO = process.env.EMAIL_REPLY_TO || FROM;

/**
 * Envía confirmación al postulante y notificación al equipo de innovación.
 */
export async function sendConfirmationEmail({ id, nombre_iniciativa, correo, nombre_postulante, departamento, fecha_iniciativa }) {
  // ── 1. Email al postulante ────────────────────────────────────────────────
  const userHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1E3A5F,#2563EB);padding:32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">✅ Iniciativa Registrada</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#334155;font-size:16px">Hola <strong>${nombre_postulante}</strong>,</p>
        <p style="color:#64748b">Tu iniciativa ha sido recibida exitosamente. El equipo de Innovación la revisará próximamente.</p>

        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#94a3b8;font-size:13px;padding:6px 0">ID de seguimiento</td>
                <td style="color:#0f172a;font-weight:bold;font-size:13px;font-family:monospace">${id}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:6px 0">Iniciativa</td>
                <td style="color:#0f172a;font-size:13px">${nombre_iniciativa}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:6px 0">Departamento</td>
                <td style="color:#0f172a;font-size:13px">${departamento}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:6px 0">Fecha ingreso</td>
                <td style="color:#0f172a;font-size:13px">${fecha_iniciativa}</td></tr>
            <tr><td style="color:#94a3b8;font-size:13px;padding:6px 0">Estado actual</td>
                <td><span style="background:#FEF3C7;color:#92400E;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:bold">🟡 Recibido</span></td></tr>
          </table>
        </div>

        <p style="color:#64748b;font-size:14px">Recibirás actualizaciones cuando el estado de tu iniciativa cambie.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;text-align:center">
          Este es un correo automático — por favor no respondas directamente a este mensaje.
        </p>
      </div>
    </div>
  `;

  // ── 2. Notificación interna al equipo ────────────────────────────────────
  const teamHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1E3A5F;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:white;margin:0;font-size:18px">🆕 Nueva Iniciativa Recibida</h2>
      </div>
      <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:#94a3b8;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">ID</td>
              <td style="color:#0f172a;font-weight:bold;font-family:monospace;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">${id}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">Iniciativa</td>
              <td style="color:#0f172a;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">${nombre_iniciativa}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">Postulante</td>
              <td style="color:#0f172a;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">${nombre_postulante}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">Correo</td>
              <td style="color:#2563EB;font-size:13px;padding:8px 0;border-bottom:1px solid #f1f5f9">${correo}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;padding:8px 0">Departamento</td>
              <td style="color:#0f172a;font-size:13px;padding:8px 0">${departamento}</td></tr>
        </table>
        <p style="color:#64748b;font-size:13px;margin-top:20px">
          Accede al dashboard para revisar y actualizar el estado de esta iniciativa.
        </p>
      </div>
    </div>
  `;

  // Enviar ambos emails en paralelo
  const [userResult, teamResult] = await Promise.allSettled([
    resend.emails.send({
      from:     FROM,
      replyTo:  REPLYTO,
      to:       [correo],
      subject:  `✅ Iniciativa registrada: ${nombre_iniciativa}`,
      html:     userHtml,
    }),
    resend.emails.send({
      from:    FROM,
      to:      [REPLYTO],
      subject: `🆕 Nueva iniciativa de ${nombre_postulante} — ${departamento}`,
      html:    teamHtml,
    }),
  ]);

  if (userResult.status === "rejected") {
    console.error("Error enviando email al usuario:", userResult.reason);
  }
  if (teamResult.status === "rejected") {
    console.error("Error enviando email al equipo:", teamResult.reason);
  }

  return { ok: userResult.status === "fulfilled" };
}
