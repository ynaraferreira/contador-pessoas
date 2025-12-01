import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const FILE_NAME = "contador.json";

// ---- Carrega valor atual ----
async function loadContador() {
  const blobs = await list();
  const existing = blobs.blobs.find(b => b.pathname === FILE_NAME);

  if (!existing) return 0;

  const res = await fetch(existing.url);
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    return json.contador ?? 0;
  } catch {
    return 0;
  }
}

// ---- GET ----
export async function GET() {
  const contador = await loadContador();
  return NextResponse.json({ contador });
}

// ---- POST ----
export async function POST(request: Request) {
  const body = await request.json();
  const novoValor = body.contador ?? 0;

  await put(FILE_NAME, JSON.stringify({ contador: novoValor }), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true });
}
