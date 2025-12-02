import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export const runtime = "nodejs";

const FILE_NAME = "eventos.json";

// ---------------------------
// Ler eventos
// ---------------------------
async function loadEventos() {
  const arquivos = await list({ prefix: "" });

  const item = arquivos.blobs.find(b => b.pathname === FILE_NAME);

  if (!item) return [];

  const res = await fetch(item.url, { cache: "no-store" });
  return await res.json();
}

// ---------------------------
// GET
// ---------------------------
export async function GET() {
  try {
    const eventos = await loadEventos();

    eventos.sort((a: any, b: any) => a.ts - b.ts);

    return NextResponse.json(eventos, {
      headers: { "Cache-Control": "no-store" }
    });

  } catch (err) {
    console.error("GET ERROR /api/eventos:", err);
    return NextResponse.json({ error: "Erro ao ler eventos" }, { status: 500 });
  }
}

// ---------------------------
// POST
// ---------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventos = await loadEventos();

    eventos.push({
      tipo: body.tipo,
      sensor: body.sensor,
      contador: body.contador,
      ts: Date.now(),
    });

    await put(
      FILE_NAME,
      JSON.stringify(eventos, null, 2),
      {
        access: "public",
        contentType: "application/json"
      }
    );

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );

  } catch (err) {
    console.error("POST ERROR /api/eventos:", err);
    return NextResponse.json({ error: "Erro ao salvar eventos" }, { status: 500 });
  }
}
