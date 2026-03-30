import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/email";

// GET /api/iniciativas — listar todas
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const departamento = searchParams.get("departamento");

  let query = supabaseAdmin
    .from("iniciativas")
    .select("*")
    .order("created_at", { ascending: false });

  if (estado && estado !== "Todos") query = query.eq("estado", estado);
  if (departamento && departamento !== "Todos") query = query.eq("departamento", departamento);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/iniciativas — crear nueva iniciativa
export async function POST(request) {
  const body = await request.json();

  const {
    nombre_iniciativa, correo, nombre_postulante, departamento,
    problema, solucion, beneficio, impacto, impacto_otros_texto,
    archivos, fecha_iniciativa,
  } = body;

  // Validación básica server-side
  if (!nombre_iniciativa || !correo || !nombre_postulante || !departamento ||
      !problema || !solucion || !beneficio || !impacto?.length || !fecha_iniciativa) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Insertar en Supabase
  const { data, error } = await supabaseAdmin
    .from("iniciativas")
    .insert([{
      nombre_iniciativa,
      correo,
      nombre_postulante,
      departamento,
      problema,
      solucion,
      beneficio,
      impacto,
      impacto_otros_texto: impacto_otros_texto || null,
      archivos: archivos || [],
      fecha_iniciativa,
      estado: "Recibido",
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enviar emails (no bloquear si falla)
  try {
    await sendConfirmationEmail(data);
  } catch (emailError) {
    console.error("Error al enviar email:", emailError);
  }

  return NextResponse.json(data, { status: 201 });
}
