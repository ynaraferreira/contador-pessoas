export const runtime = "nodejs";

import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE = "eventos.json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

async function loadEventos() {
  const arquivos = await list();
  const item = arquivos.blobs.find((b) => b.pathname === FILE);

  if (!item) return [];

  const res = await fetch(item.url);
  return await res.json();
}

export async function GET() {
  const eventos = await loadEventos();
  return NextResponse.json(eventos, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventos = await loadEventos();

    eventos.push({
      tipo: body.tipo,
      sensor: body.sensor,
      contador: body.contador,
      ts: Date.now(),
    });

    await put(FILE, JSON.stringify(eventos, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (e) {
    console.log("Erro:", e);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
