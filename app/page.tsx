"use client";

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
