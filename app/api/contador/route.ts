import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export const runtime = "nodejs";

const FILE_NAME = "contador.json";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

// ===============================
// OPTIONS (CORS)
// ===============================
export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

// ===============================
// LER CONTADOR DO BLOB
// ===============================
async function loadContador() {
  try {
    const arquivos = await list({ prefix: "" });

    const existente = arquivos.blobs.find(
      (b) => b.pathname === FILE_NAME
    );

    if (!existente) return { pessoas: 0 };

    const res = await fetch(existente.url, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    console.error("ERRO loadContador:", e);
    return { pessoas: 0 };
  }
}

// ===============================
// GET – retorna { pessoas: number }
// ===============================
export async function GET() {
  try {
    const data = await loadContador();
    return NextResponse.json(data, { headers: CORS });
  } catch (e) {
    console.error("GET ERROR:", e);
    return NextResponse.json(
      { error: "Erro ao ler contador" },
      { status: 500, headers: CORS }
    );
  }
}

// ===============================
// POST – salva novo valor de pessoas
// ===============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pessoas = Number(body.pessoas || 0);

    await put(
      FILE_NAME,
      JSON.stringify({ pessoas }, null, 2),
      {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false, // 👈 ESSENCIAL para sobrescrever sempre o mesmo arquivo
      }
    );

    return NextResponse.json(
      { ok: true, pessoas },
      { headers: CORS }
    );
  } catch (e) {
    console.error("PUT ERROR:", e);
    return NextResponse.json(
      { error: "Erro ao salvar contador" },
      { status: 500, headers: CORS }
    );
  }
}
