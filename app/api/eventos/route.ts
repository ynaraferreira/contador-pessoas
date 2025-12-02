import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ================================
//     CONEXÃO COM SUPABASE
// ================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ================================
//     GET  → Retorna o histórico
// ================================
export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from("contador_logs")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("GET ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(logs, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}

// ================================
//     POST → Salva evento + atualiza contador
// ================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tipo = body.tipo;      // "ENTRADA" ou "SAIDA"
    const sensor = body.sensor;  // esq / dir / etc (se quiser)
    const contador = Number(body.contador);

    if (!tipo || isNaN(contador)) {
      return NextResponse.json(
        { error: "Dados inválidos no body" },
        { status: 400 }
      );
    }

    // 1) Atualiza contador atual
    const { error: updateError } = await supabase
      .from("contador_estado")
      .update({
        total: contador,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (updateError) {
      console.error("UPDATE ERROR:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 2) Salva no histórico
    const { error: logError } = await supabase
      .from("contador_logs")
      .insert({
        movimento: tipo,  // renomeei para movimento porque é como a tabela está
        valor: contador,
        sensor: sensor ?? null,
      });

    if (logError) {
      console.error("LOG ERROR:", logError);
      return NextResponse.json(
        { error: logError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// ================================
//     OPTIONS (CORS)
// ================================
export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}
