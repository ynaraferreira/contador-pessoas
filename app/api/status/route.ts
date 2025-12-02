import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase env vars ausentes (URL ou KEY).");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // pega o último log de movimento
    const { data, error } = await supabase
      .from("contador_logs")
      .select("criado_em")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("STATUS ERROR:", error);
      return NextResponse.json(
        { status: "offline", online: false },
        { status: 500 }
      );
    }

    if (!data) {
      // nunca teve evento ainda
      return NextResponse.json(
        { status: "offline", online: false, lastPing: null },
        { status: 200 }
      );
    }

    const lastTs = new Date(data.criado_em).getTime();
    const diffMs = Date.now() - lastTs;

    // considera "online" se teve evento nos últimos 20 segundos
    const isOnline = diffMs < 20_000;

    return NextResponse.json(
      {
        status: isOnline ? "online" : "offline",
        online: isOnline,
        lastPing: data.criado_em,
        diffMs,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("STATUS ERROR (EXCEPTION):", e);
    return NextResponse.json(
      { status: "offline", online: false, lastPing: null },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}
