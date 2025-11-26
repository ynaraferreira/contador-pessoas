// app/api/contador/route.ts
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
}
