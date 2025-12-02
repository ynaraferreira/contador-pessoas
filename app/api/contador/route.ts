import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const FILE_NAME = "contador.json";

async function load() {
  const existing = (await list()).blobs.find(b => b.pathname === FILE_NAME);
  if (!existing) return { contador: 0 };

  const res = await fetch(existing.url);
  return await res.json();
}

export async function GET() {
  const data = await load();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const novo = { contador: body.contador ?? 0 };

  await put(FILE_NAME, JSON.stringify(novo, null, 2), {
    contentType: "application/json",
    access: "public",
  });

  return NextResponse.json({ ok: true, contador: novo.contador });
}
