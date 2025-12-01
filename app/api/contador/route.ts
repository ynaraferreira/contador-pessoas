/* // app/api/contador/route.ts
import { NextRequest, NextResponse } from "next/server";

let pessoas = 0; // armazenamento em memória (reseta a cada deploy/restart)

export async function GET(_req: NextRequest) {
  return NextResponse.json({ pessoas });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const valor = Number(body?.pessoas);

    if (Number.isNaN(valor)) {
      return NextResponse.json(
        { error: "campo 'pessoas' deve ser número" },
        { status: 400 }
      );
    }

    pessoas = valor;

    return NextResponse.json({ ok: true, pessoas });
  } catch (e) {
    return NextResponse.json(
      { error: "JSON inválido" },
      { status: 400 }
    );
  }
} */import { put, list, getDownloadUrl } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

/** Lê o contador do Blob Storage */
async function readCounter() {
  const items = await list();
  const file = items.blobs.find(b => b.pathname === FILE_NAME);

  if (!file) {
    return 0; // Se não existir, começa do zero
  }

  const url = await getDownloadUrl(FILE_NAME);
  const res = await fetch(url);
  const data = await res.json();

  return data.contador ?? 0;
}

/** Salva o contador no Blob Storage */
async function saveCounter(value: number) {
  await put(FILE_NAME, JSON.stringify({ contador: value }), {
    contentType: "application/json",
    access: "public",
  });
}

/** GET → retorna o contador */
export async function GET() {
  const contador = await readCounter();
  return NextResponse.json({ contador });
}

/** POST → atualiza contador */
export async function POST(req: Request) {
  const body = await req.json();
  const novoValor = body.contador;

  await saveCounter(novoValor);

  return NextResponse.json({ ok: true, contador: novoValor });
}
