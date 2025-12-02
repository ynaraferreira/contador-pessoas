import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

// Lê o arquivo do blob
async function loadContador() {
  const arquivos = await list();
  const item = arquivos.blobs.find((b) => b.pathname === FILE_NAME);

  if (!item) return { pessoas: 0 };

  const res = await fetch(item.url);
  return res.json();
}

// GET → retorna o contador atual
export async function GET() {
  const data = await loadContador();
  return NextResponse.json(data);
}

// POST → atualiza o contador
export async function POST(req: Request) {
  const body = await req.json();
  const pessoas = body.pessoas ?? 0;

  // Salva no blob
  await put(FILE_NAME, JSON.stringify({ pessoas }, null, 2), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true, pessoas });
}
