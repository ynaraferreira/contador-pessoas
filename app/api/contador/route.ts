import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export const runtime = "nodejs";

const FILE_NAME = "contador.json";

// ===============================
// LER ARQUIVO DO BLOB
// ===============================
async function loadContador() {
  try {
    const arquivos = await list({ prefix: "" });

    // 🔥 CORREÇÃO FINAL — usar pathname
    const item = arquivos.blobs.find((b) => b.pathname === FILE_NAME);

    if (!item) return { pessoas: 0 };

    const res = await fetch(item.url, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    console.error("ERRO loadContador:", e);
    return { pessoas: 0 };
  }
}

// ===============================
// GET
// ===============================
export async function GET() {
  const data = await loadContador();
  return NextResponse.json(data, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

// ===============================
// POST
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
        addRandomSuffix: false, // 🔥 ESSENCIAL
      }
    );

    return NextResponse.json(
      { ok: true, pessoas },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );

  } catch (e) {
    console.error("PUT ERROR:", e);
    return NextResponse.json(
      { error: "Erro ao salvar contador" },
      { status: 500 }
    );
  }
}

// ===============================
// OPTIONS (CORS)
// ===============================
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
