import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export const runtime = "nodejs";

const FILE_NAME = "eventos.json";

async function loadEventos() {
  try {
    const arquivos = await list({ prefix: "" });

    const existente = arquivos.blobs.find(
      (b) => b.pathname === FILE_NAME
    );

    if (!existente) return [];

    const res = await fetch(existente.url, {
      cache: "no-store",
    });

    return await res.json();
  } catch (e) {
    console.error("ERRO loadEventos:", e);
    return [];
  }
}

export async function GET() {
  const eventos = await loadEventos();
  return NextResponse.json(eventos, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function POST(request) {
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
        contentType: "application/json",
        addRandomSuffix: false, // <- ESSENCIAL
      }
    );

    return NextResponse.json({ ok: true }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (e) {
    console.error("PUT ERROR:", e);
    return NextResponse.json(
      { error: "Erro ao salvar eventos" },
      { status: 500 }
    );
  }
}

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
