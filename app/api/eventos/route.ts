import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "eventos.json";

// --------------------------------------------------------------
// Lê o arquivo do Blob
// --------------------------------------------------------------
async function loadEventos() {
  const files = await list();
  const existing = files.blobs.find(b => b.pathname === FILE_NAME);

  if (!existing) return [];

  const res = await fetch(existing.url);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

// --------------------------------------------------------------
// GET → retorna todos os eventos
// --------------------------------------------------------------
export async function GET() {
  const eventos = await loadEventos();

  // ordena do mais antigo para o mais novo
  eventos.sort((a, b) => a.ts - b.ts);

  return NextResponse.json(eventos);
}

// --------------------------------------------------------------
// POST → adiciona um novo evento no histórico
// Body deve conter: tipo, sensor, contador
// --------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.tipo || !body.sensor || body.contador === undefined) {
      return NextResponse.json(
        { error: "Campos inválidos. Envie tipo, sensor e contador." },
        { status: 400 }
      );
    }

    const eventos = await loadEventos();

    const novoEvento = {
      tipo: body.tipo,          // entrada / saida
      sensor: body.sensor,      // esquerda / direita
      contador: body.contador,  // valor final
      ts: Date.now(),           // timestamp automático
    };

    eventos.push(novoEvento);

    await put(FILE_NAME, JSON.stringify(eventos), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao registrar evento:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
