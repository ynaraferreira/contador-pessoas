export const runtime = "nodejs";

import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

async function loadContador() {
  const arquivos = await list({ prefix: "" });

  const item = arquivos.blobs.find((b) => b.pathname === FILE_NAME);

  if (!item) return { pessoas: 0 };

  const res = await fetch(item.url);
  return res.json();
}

export async function GET() {
  try {
    const data = await loadContador();
    return NextResponse.json(data, { headers: corsHeaders });
  } catch {
    return NextResponse.json(
      { error: "Erro ao ler contador" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pessoas = Number(body.pessoas || 0);

    await put(FILE_NAME, JSON.stringify({ pessoas }, null, 2), {
      access: "public",
      contentType: "application/json"
    });

    return NextResponse.json(
      { ok: true, pessoas },
      { headers: corsHeaders }
    );

  } catch (e) {
    console.error("PUT ERROR:", e);
    return NextResponse.json(
      { error: "Erro ao salvar contador" },
      { status: 500, headers: corsHeaders }
    );
  }
}
