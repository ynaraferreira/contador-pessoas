import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

async function loadContador() {
  // O prefix precisa ser passado
  const arquivos = await list({ prefix: "" });

  const item = arquivos.blobs.find((b) => b.pathname === FILE_NAME);

  if (!item) return { pessoas: 0 };

  const res = await fetch(item.url);
  return res.json();
}

// GET – retorna o contador atual
export async function GET() {
  try {
    const data = await loadContador();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao ler contador" }, { status: 500 });
  }
}

// POST – salva novo contador
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pessoas = Number(body.pessoas ?? 0);

    await put(
      FILE_NAME,
      JSON.stringify({ pessoas }, null, 2),
      {
        contentType: "application/json",
        access: "public",
      }
    );

    return NextResponse.json({ ok: true, pessoas });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar contador" }, { status: 500 });
  }
}
