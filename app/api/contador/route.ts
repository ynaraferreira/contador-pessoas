import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// --------------- CORS ----------------
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

// --------------- HELPER: SUPABASE ---------------
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO: Variáveis de ambiente do Supabase não configuradas.");
    throw new Error("Supabase env vars ausentes (URL ou KEY).");
  }

  return createClient(supabaseUrl, supabaseKey);
}

// --------------- OPTIONS ----------------
export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

// --------------- GET ----------------
// Retorna apenas:  { pessoas: X }
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("contador_estado")
      .select("total")
      .eq("id", 1)
      .maybeSingle(); // <- não dá erro se não tiver linha

    if (error) {
      console.error("GET contador error:", error);
      return NextResponse.json(
        { error: "Erro ao ler contador" },
        { status: 500, headers: CORS }
      );
    }

    const total = data?.total ?? 0;

    return NextResponse.json(
      { pessoas: total },
      { headers: CORS }
    );
  } catch (e: any) {
    console.error("GET ERROR:", e);
    return NextResponse.json(
      { error: e.message || "Erro ao ler contador" },
      { status: 500, headers: CORS }
    );
  }
}

// --------------- POST ----------------
// Salva manualmente: { pessoas: 12 }
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseClient();

    const body = await req.json();
    const pessoas = Number(body.pessoas || 0);

    const { error } = await supabase
      .from("contador_estado")
      .upsert({
        id: 1,
        total: pessoas,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("POST contador error:", error);
      return NextResponse.json(
        { error: "Erro ao salvar contador" },
        { status: 500, headers: CORS }
      );
    }

    return NextResponse.json(
      { ok: true, pessoas },
      { headers: CORS }
    );
  } catch (e: any) {
    console.error("POST ERROR:", e);
    return NextResponse.json(
      { error: e.message || "Erro ao salvar contador" },
      { status: 500, headers: CORS }
    );
  }
}
