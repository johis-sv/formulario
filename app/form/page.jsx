"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Send, Plus, RefreshCw, Mail, User, Building2, ChevronDown,
  Upload, X, Check, Paperclip, AlertTriangle, Calendar, Layers,
} from "lucide-react";
import { DEPARTMENTS, IMPACT_OPTIONS } from "@/lib/constants";

const fmtDate = (d) => new Date(d).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });

export default function FormPage() {
  const router = useRouter();
  const emptyForm = {
    nombre_iniciativa: "", correo: "", nombre_postulante: "",
    departamento: "", problema: "", solucion: "", beneficio: "",
    impacto: [], impacto_otros_texto: "",
    fecha_iniciativa: new Date().toISOString().split("T")[0],
    archivos: [],
  };
  const [form, setForm]       = useState(emptyForm);
  const [errors, setErrors]   = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null); // { id, correo, nombre_iniciativa }
  const fileRef = useRef();

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.nombre_iniciativa.trim())  e.nombre_iniciativa  = "Campo obligatorio";
    if (!form.correo.trim())             e.correo             = "Campo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";
    if (!form.nombre_postulante.trim())  e.nombre_postulante  = "Campo obligatorio";
    if (!form.departamento)              e.departamento       = "Selecciona un departamento";
    if (!form.problema.trim())           e.problema           = "Campo obligatorio";
    if (!form.solucion.trim())           e.solucion           = "Campo obligatorio";
    if (!form.beneficio.trim())          e.beneficio          = "Campo obligatorio";
    if (!form.impacto.length)            e.impacto            = "Selecciona al menos una opción";
    if (form.impacto.includes("otros") && !form.impacto_otros_texto.trim())
      e.impacto_otros_texto = "Justifica la opción 'Otros'";
    if (!form.fecha_iniciativa)          e.fecha_iniciativa   = "Campo obligatorio";
    return e;
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    set("archivos", [...form.archivos, ...files]);
  };

  const toggleImpact = (id) => {
    const cur = form.impacto;
    set("impacto", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSending(true);
    try {
      const res = await fetch("/api/iniciativas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const data = await res.json();
      setSuccess({ id: data.id, correo: form.correo, nombre_iniciativa: form.nombre_iniciativa });
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert("Ocurrió un error al enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  /* ── Success screen ─────────────────────────────────────────────────────── */
  if (success) return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Check size={40} color="white" strokeWidth={3} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#0F172A" }}
          className="text-3xl font-bold mb-3">¡Iniciativa Registrada!</h2>
        <p className="text-slate-500 mb-2 text-lg">
          ID de seguimiento: <strong className="text-slate-800 font-mono">{success.id.slice(0, 8).toUpperCase()}</strong>
        </p>
        <p className="text-slate-400 text-sm mb-8 max-w-md">
          Se ha enviado una notificación de confirmación al correo registrado. Puedes dar seguimiento en el Dashboard.
        </p>
        <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}
          className="rounded-xl p-4 mb-8 max-w-sm w-full text-left">
          <p className="text-sm text-emerald-700 flex items-center gap-2">
            <Mail size={16} /> Notificación enviada a <strong>{success.correo}</strong>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => setSuccess(null)}
            style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)", color: "white" }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow hover:opacity-90 transition">
            <Plus size={18} /> Registrar Nueva Iniciativa
          </button>
          <button onClick={() => router.push("/dashboard")}
            style={{ border: "1px solid #E2E8F0", background: "white", color: "#475569" }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition">
            Ver Dashboard →
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Form ──────────────────────────────────────────────────────────────── */
  const Field = ({ label, required, error, hint, children, num }) => (
    <div className="mb-6">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span style={{ background: "#1E3A5F", color: "white" }}
          className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">{num}</span>
        <label className="text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      {hint && <p className="text-xs text-slate-400 mb-2 ml-8">{hint}</p>}
      <div className="ml-8">{children}</div>
      {error && <p className="text-xs text-red-500 mt-1 ml-8 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
    </div>
  );

  const inputCls = (err) => `w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none focus:ring-2 focus:ring-blue-200 ${err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-400"}`;
  const textaCls = (err) => `w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none focus:ring-2 focus:ring-blue-200 resize-none ${err ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-400"}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)" }}
          className="rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Layers size={28} className="opacity-80" />
            <h1 style={{ fontFamily: "'Playfair Display',serif" }} className="text-2xl font-bold">Registro de Iniciativas</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Completa el formulario para registrar tu iniciativa de mejora o innovación.
            Los campos con <span className="text-yellow-300 font-bold">*</span> son obligatorios.
          </p>
        </div>

        <div style={{ background: "white", border: "1px solid #E2E8F0" }} className="rounded-2xl p-6 shadow-sm">

          <Field num="1" label="Nombre de la Iniciativa" required error={errors.nombre_iniciativa}>
            <input value={form.nombre_iniciativa} onChange={(e) => set("nombre_iniciativa", e.target.value)}
              placeholder="Ej: Automatización de asignación de tareas" className={inputCls(errors.nombre_iniciativa)} />
          </Field>

          <Field num="2" label="Correo Empresarial del Postulante" required
            hint="Ingrese su correo electrónico empresarial" error={errors.correo}>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)}
                placeholder="nombre@empresa.com" className={inputCls(errors.correo) + " pl-9"} />
            </div>
          </Field>

          <Field num="3" label="Nombre del Postulante" required hint="Ingresa tu nombre y apellido" error={errors.nombre_postulante}>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input value={form.nombre_postulante} onChange={(e) => set("nombre_postulante", e.target.value)}
                placeholder="Nombres y Apellidos" className={inputCls(errors.nombre_postulante) + " pl-9"} />
            </div>
          </Field>

          <Field num="4" label="Departamento" required hint="Selecciona a qué departamento perteneces" error={errors.departamento}>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              <select value={form.departamento} onChange={(e) => set("departamento", e.target.value)}
                className={inputCls(errors.departamento) + " pl-9 pr-9 appearance-none cursor-pointer"}>
                <option value="">— Selecciona un departamento —</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </Field>

          <Field num="5" label="Descripción del Problema" required error={errors.problema}
            hint="Describe de manera detallada cuál es el problema actual">
            <textarea rows={5} value={form.problema} onChange={(e) => set("problema", e.target.value)}
              placeholder="Ej: Actualmente, después de ingresar un producto en nuestro sistema, debo asignar manualmente una tarea..."
              className={textaCls(errors.problema)} />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.problema.length} caracteres</p>
          </Field>

          <Field num="6" label="Descripción de la Solución" required error={errors.solucion}
            hint="Describe de manera detallada cómo se te ocurre solucionar el problema">
            <textarea rows={5} value={form.solucion} onChange={(e) => set("solucion", e.target.value)}
              placeholder="Ej: Propongo implementar una funcionalidad que automatice la asignación de tareas..."
              className={textaCls(errors.solucion)} />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.solucion.length} caracteres</p>
          </Field>

          <Field num="7" label="Beneficio del Desarrollo" required error={errors.beneficio}
            hint="Describe cuál sería el beneficio una vez que esté listo el desarrollo">
            <textarea rows={5} value={form.beneficio} onChange={(e) => set("beneficio", e.target.value)}
              placeholder="Ej: La automatización permitirá ahorrar la mitad del tiempo que actualmente dedico..."
              className={textaCls(errors.beneficio)} />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.beneficio.length} caracteres</p>
          </Field>

          <Field num="8" label="Impacto si NO se Realiza" required error={errors.impacto}
            hint="Marca las opciones que corresponda">
            <div className="space-y-2">
              {IMPACT_OPTIONS.map((opt) => (
                <label key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${form.impacto.includes(opt.id) ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${form.impacto.includes(opt.id) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                    onClick={() => toggleImpact(opt.id)}>
                    {form.impacto.includes(opt.id) && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-slate-700" onClick={() => toggleImpact(opt.id)}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.impacto && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />{errors.impacto}
              </p>
            )}
            {form.impacto.includes("otros") && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Justificación para "Otros" <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={form.impacto_otros_texto}
                  onChange={(e) => set("impacto_otros_texto", e.target.value)}
                  placeholder="Describe el impacto en la categoría 'Otros'..."
                  className={textaCls(errors.impacto_otros_texto)} />
                {errors.impacto_otros_texto && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />{errors.impacto_otros_texto}
                  </p>
                )}
              </div>
            )}
          </Field>

          <Field num="9" label="Información Adicional"
            hint="Adjunta archivos que permitan conocer más la iniciativa (opcional)">
            <div onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #CBD5E1", background: "#F8FAFC" }}
              className="rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">Haz clic para subir archivos</p>
              <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, imágenes</p>
            </div>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
            {form.archivos.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.archivos.map((f, i) => (
                  <div key={i} style={{ background: "#F0F4FF", border: "1px solid #DBEAFE" }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-blue-700">
                    <Paperclip size={13} />
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={() => set("archivos", form.archivos.filter((_, j) => j !== i))}
                      className="hover:text-red-500 transition"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field num="10" label="Fecha de Ingreso de la Iniciativa" required error={errors.fecha_iniciativa}>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input type="date" value={form.fecha_iniciativa}
                onChange={(e) => set("fecha_iniciativa", e.target.value)}
                className={inputCls(errors.fecha_iniciativa) + " pl-9"} />
            </div>
          </Field>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button onClick={handleSubmit} disabled={sending}
              style={{ background: sending ? "#94A3B8" : "linear-gradient(135deg,#1E3A5F,#2563EB)", color: "white" }}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition disabled:cursor-not-allowed">
              {sending ? (
                <><RefreshCw size={20} className="animate-spin" /> Enviando...</>
              ) : (
                <><Send size={20} /> Enviar Iniciativa</>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Al enviar, recibirás una confirmación en tu correo empresarial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
