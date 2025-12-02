import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "eventos.json";

async function loadEventos() {
  const existing = (await list()).blobs.find(b => b.pathname === FILE_NAME);
  if (!existing) return [];

  const res = await fetch(existing.url);
  return await res.json();
}

export async function GET() {
  const eventos = await loadEventos();

  eventos.sort((a: any, b: any) => a.ts - b.ts);

  return NextResponse.json(eventos);
}

export async function POST(request: Request) {
  const body = await request.json();

  const eventos = await loadEventos();

  eventos.push({
    tipo: body.tipo,
    sensor: body.sensor,
    contador: body.contador,
    ts: Date.now(),
  });

  await put(FILE_NAME, JSON.stringify(eventos, null, 2), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true });
}
