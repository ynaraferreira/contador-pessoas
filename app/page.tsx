/*"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [pessoas, setPessoas] = useState<number | null>(null);
  const [statusTexto, setStatusTexto] = useState<string>("Carregando...");
  const [statusClasse, setStatusClasse] = useState<string>("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("--:--:--");

  function classificarOcupacao(valor: number) {
    if (valor <= 0) {
      return { texto: "Sala vazia", classe: "status-low" };
    } else if (valor === 1) {
      return { texto: "1 pessoa no ambiente", classe: "status-low" };
    } else if (valor > 1 && valor <= 4) {
      return { texto: "Ocupação moderada", classe: "status-medium" };
    } else if (valor > 4 && valor <= 10) {
      return { texto: "Ambiente cheio", classe: "status-high" };
    } else {
      return { texto: "Lotação alta! Avaliar limite", classe: "status-critical" };
    }
  }

  function formatarHoraAtual() {
    const d = new Date();
    return d.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  }

  async function atualizarDados() {
    try {
      const res = await fetch("/api/contador", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const valor = Number(data?.pessoas ?? 0);

      setPessoas(valor);

      const { texto, classe } = classificarOcupacao(valor);
      setStatusTexto(texto);
      setStatusClasse(classe);

      setUltimaAtualizacao(formatarHoraAtual());
    } catch (err) {
      console.error(err);
      setStatusTexto("Erro ao atualizar dados");
      setStatusClasse("status-critical");
    }
  }

  useEffect(() => {
    atualizarDados();
    const id = setInterval(atualizarDados, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Contador de Pessoas</h1>
        <p className="subtitle">Monitor de ocupação em tempo real</p>
      </header>

      <section className="card">
        <p className="label">Pessoas na sala agora:</p>
        <p className="big-number">
          {pessoas === null ? "--" : pessoas}
        </p>

        <p className="status-label">Status da ocupação:</p>
        <p className={`status-text ${statusClasse}`}>
          {statusTexto}
        </p>
      </section>

      <section className="card small">
        <p className="info-title">Última atualização:</p>
        <p className="info-text">{ultimaAtualizacao}</p>
      </section>
    </main>
  );
}
*/
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [animate, setAnimate] = useState(false);

  // Dispara animação ao carregar
  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-28"
      style={{ backgroundColor: "#1c3f60" }}
    >
      {/* CARD CENTRAL COM ANIMAÇÃO */}
      <div
        className="w-full max-w-md text-center rounded-3xl shadow-2xl"
        style={{
          backgroundColor: "#ffffff",
          padding: "50px 40px",
          border: "1px solid #e8ecf2",

          /* 🔥 Animação premium */
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0px)" : "translateY(80px)",
          transition:
            "opacity 1.55s ease, transform 2.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            marginBottom: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src="/img/fluxuss.png"
            alt="Logo Fluxus"
            width={210}
            height={210}
            className="object-cover rounded-2xl shadow-lg"
            style={{
              borderRadius: "10px",
              boxShadow: "0 12px 25px rgba(0,0,0,0.20)",
            }}
          />
        </div>

        {/* SUBTÍTULO */}
        <p
          style={{
            color: "#6b7a86",
            fontSize: "15px",
            lineHeight: "22px",
            marginBottom: "45px",
          }}
        >
          Sistema integrado de contagem de pessoas no ambiente
        </p>

        {/* BOTÃO */}
        <a
          href="/contador"
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
          Acessar Contador
        </a>
      </div>

      {/* NAVBAR MOBILE */}
      <nav
        className="fixed bottom-0 left-0 right-0 py-3 flex justify-around items-center"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #d7dce2",
          boxShadow: "0 -6px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* HOME - ativo */}
        <Link href="/" className="flex flex-col items-center">
          <svg width="28" height="28" fill="#1c3f60" viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
          <span className="text-xs" style={{ color: "#1c3f60", fontWeight: "700" }}>
            Início
          </span>
        </Link>

        {/* CONTADOR */}
        <Link href="/contador" className="flex flex-col items-center">
          <svg width="28" height="28" fill="#6b7a86" viewBox="0 0 24 24">
            <path d="M12 7a5 5 0 1 1-4.546 2.916l1.843.793A3 3 0 1 0 12 9V7z" />
          </svg>
          <span className="text-xs" style={{ color: "#6b7a86" }}>
            Contador
          </span>
        </Link>

        {/* RELATÓRIOS */}
        <Link href="/relatorios" className="flex flex-col items-center">
          <svg width="28" height="28" fill="#6b7a86" viewBox="0 0 24 24">
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
