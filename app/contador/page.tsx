"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ContadorPage() {
  const [contador, setContador] = useState(0);
  const [status, setStatus] = useState("offline");
  const [animate, setAnimate] = useState(false);

  // -----------------------------
  // Animação inicial
  // -----------------------------
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // -----------------------------
  // Atualiza contador real
  // -----------------------------
  useEffect(() => {
    async function atualizar() {
      try {
        const r = await fetch("/api/contador", { cache: "no-store" });
        if (!r.ok) throw new Error("Falha");

        const data = await r.json();
        setContador(data.pessoas ?? 0);
      } catch {
        setContador(0);
      }
    }

    atualizar();
    const interval = setInterval(atualizar, 1200);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // Verifica status do ESP32
  // -----------------------------
  useEffect(() => {
    async function ping() {
      try {
        const r = await fetch("/api/status", { cache: "no-store" });
        setStatus(r.ok ? "online" : "offline");
      } catch {
        setStatus("offline");
      }
    }

    ping();
    const interval = setInterval(ping, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center pb-32 px-6"
      style={{ backgroundColor: "#f3f6fa" }}
    >
      {/* CARD CENTRAL */}
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl text-center transition-all"
        style={{
          padding: "45px 40px",
          backgroundColor: "#ffffff",
          border: "1px solid #e8ecf2",
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0px)" : "translateY(60px)",
          transition:
            "opacity 1.2s ease, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* TÍTULO */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#1c3f60",
            marginBottom: "25px",
          }}
        >
          Contador de Pessoas
        </h1>

        {/* STATUS DO ESP32 */}
        <p
          style={{
            color: status === "online" ? "#22c55e" : "#ef4444",
            fontSize: "13px",
            marginBottom: "25px",
          }}
        >
          ESP32: {status}
        </p>

        {/* VALOR DO CONTADOR */}
        <div
          className="rounded-2xl shadow-md flex flex-col items-center justify-center"
          style={{
            backgroundColor: "#eef2f6",
            padding: "28px 10px",
            border: "1px solid #d8dde4",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              fontSize: "46px",
              fontWeight: "800",
              color: "#1c3f60",
            }}
          >
            {contador}
          </span>

          <p
            style={{
              color: "#6b7a86",
              marginTop: "6px",
              fontSize: "14px",
            }}
          >
            Pessoas no ambiente
          </p>
        </div>

        {/* BOTÃO */}
        <Link
          href="/relatorios"
          style={{
            backgroundColor: "#1c3f60",
            color: "#f3f6fa",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: 600,
            display: "block",
            width: "100%",
          }}
        >
          Acessar Relatório
        </Link>
      </div>

      {/* NAVBAR */}
      <nav
        className="fixed bottom-0 left-0 right-0 py-3 flex justify-around items-center"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #d7dce2",
          boxShadow: "0 -6px 18px rgba(0,0,0,0.1)",
        }}
      >
        <Link href="/" className="flex flex-col items-center">
          <svg width="26" height="26" fill="#6b7a86" viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
          <span className="text-xs" style={{ color: "#6b7a86" }}>
            Início
          </span>
        </Link>

        <Link href="/contador" className="flex flex-col items-center">
          <svg width="26" height="26" fill="#1c3f60" viewBox="0 0 24 24">
            <path d="M12 7a5 5 0 1 1-4.546 2.916l1.843.793A3 3 0 1 0 12 9V7z" />
          </svg>
          <span
            className="text-xs"
            style={{ color: "#1c3f60", fontWeight: "700" }}
          >
            Contador
          </span>
        </Link>

        <Link href="/relatorios" className="flex flex-col items-center">
          <svg width="26" height="26" fill="#6b7a86" viewBox="0 0 24 24">
            <path d="M3 4h18v2H3V4zm0 6h18v2H3v-2zm0 6h12v2H3v-2z" />
          </svg>
          <span className="text-xs" style={{ color: "#6b7a86" }}>
            Relatórios
          </span>
        </Link>
      </nav>
    </div>
  );
}
