import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH /api/iniciativas/[id] — actualizar estado
export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { estado } = body;

  const validStatuses = ["Recibido", "En Revisión", "En Desarrollo", "Completado", "Rechazado"];
  if (!validStatuses.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("iniciativas")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// GET /api/iniciativas/[id] — obtener una iniciativa
export async function GET(request, { params }) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from("iniciativas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
