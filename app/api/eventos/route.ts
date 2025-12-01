import { put, list, getDownloadUrl } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "eventos.json";

async function loadEventos() {
  const existing = (await list()).blobs.find(
    (b) => b.pathname === FILE_NAME
  );

  if (!existing) return [];

  // pega o link de download
  const downloadUrl = await getDownloadUrl(existing.pathname);

  const res = await fetch(downloadUrl);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
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
    ts: Date.now(),
  });

  await put(FILE_NAME, JSON.stringify(eventos), {
    access: "public",
    contentType: "application/json",
  });

  return NextResponse.json({ ok: true });
}
