import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "eventos.json";

async function loadEventos(): Promise<any[]> {
  const blobs = await list();
  const existing = blobs.blobs.find(b => b.pathname === FILE_NAME);
  if (!existing) return [];
  
  const file = await fetch(existing.url);
  const text = await file.text();
  return JSON.parse(text);
}

export async function GET() {
  const eventos = await loadEventos();
  return NextResponse.json(eventos);
}

export async function POST(req: Request) {
  const body = await req.json();
  
  const eventos = await loadEventos();
  eventos.push({
    tipo: body.tipo,
    ts: Date.now(),
  });

  await put(FILE_NAME, JSON.stringify(eventos), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true });
}
