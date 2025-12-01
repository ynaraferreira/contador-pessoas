import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const FILE_NAME = "eventos.json";

// ------------------------------------------------------
// LER EVENTOS
// ------------------------------------------------------
async function loadEventos(): Promise<
  { ts: number; tipo: string; valor?: number }[]
> {
  const blobs = await list();
  const existing = blobs.blobs.find(b => b.pathname === FILE_NAME);

  // Se não existe arquivo, retorna lista vazia
  if (!existing) return [];

  const res = await fetch(existing.url);
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

// ------------------------------------------------------
// GET — retorna lista completa de eventos
// ------------------------------------------------------
export async function GET() {
  const eventos = await loadEventos();

  // ordena por timestamp (mais antigo primeiro)
  eventos.sort((a, b) => a.ts - b.ts);

  return NextResponse.json(eventos);
}

// ------------------------------------------------------
// POST — adiciona novo evento
// ------------------------------------------------------
export async function POST(request: Request) {
  const body = await request.json();

  const tipo = body.tipo ?? "evento";
  const valor = body.valor ?? null;

  const eventos = await loadEventos();

  eventos.push({
    ts: Date.now(),
    tipo,
    valor: valor ?? undefined
  });

  await put(FILE_NAME, JSON.stringify(eventos, null, 2), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true });
}
