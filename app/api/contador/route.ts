import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

async function loadContador(): Promise<number> {
  const blobs = await list();
  const existing = blobs.blobs.find(b => b.pathname === FILE_NAME);
  if (!existing) return 0;

  const file = await fetch(existing.url);
  const text = await file.text();
  return JSON.parse(text).contador ?? 0;
}

export async function GET() {
  const contador = await loadContador();
  return NextResponse.json({ contador });
}

export async function POST(req: Request) {
  const body = await req.json();
  const novo = body.pessoas ?? 0;

  await put(FILE_NAME, JSON.stringify({ contador: novo }), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true });
}
