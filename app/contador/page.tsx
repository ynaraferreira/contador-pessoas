"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
      if (!r.ok) {
        setStatus("offline");
        return;
      }

      const data = await r.json();
      setStatus(data.status === "online" ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }

  ping();
  const interval = setInterval(ping, 3500);
  return () => clearInterval(interval);
}, []);


  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 pb-24"
      style={{ backgroundColor: "#f3f6fa" }}
    >
      {/* head */}
      <header
        className="w-full flex items-center justify-between"
        style={{
          padding: "18px 10px",
          marginBottom: "25px",
        }}
      >
        {/* Logo com cantos arredondados e sombra */}
        <Image
          src="/img/fluxuss.png"
          alt="Fluxuss"
          width={140}
          height={50}
          style={{
            objectFit: "cover",
            borderRadius: "14px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          }}
        />

        {/* Status bem discreto e elegante */}
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: status === "online" ? "#22c55e" : "#ef4444",
          }}
        >
          <span style={{ fontSize: "11px" }}>●</span>
          {status}
        </span>
      </header>

      {/* ----------- CARD CENTRAL ----------- */}
      <div
        className="w-full max-w-lg rounded-3xl shadow-xl text-center transition-all"
        style={{
          padding: "40px 32px",
          backgroundColor: "#ffffff",
          border: "1px solid #e1e6ee",
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(60px)",
          transition:
            "opacity 1.2s ease, transform 1.8s cubic-bezier(0.16,1,0.3,1)",
          marginTop: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: "#1c3f60",
            marginBottom: "18px",
          }}
        >
          Contador de Pessoas
        </h1>

        {/* Valor do contador */}
        <div
          className="rounded-2xl shadow-md flex flex-col items-center justify-center"
          style={{
            backgroundColor: "#eef2f6",
            padding: "30px 10px",
            border: "1px solid #d8dde4",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#1c3f60",
            }}
          >
            {contador}
          </span>

          <p
            style={{
              color: "#6b7a86",
              marginTop: "10px",
              fontSize: "15px",
            }}
          >
            Pessoas no ambiente
          </p>
        </div>

        {/* Botão */}
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

      {/* ----------- NAVBAR INFERIOR ----------- */}
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
