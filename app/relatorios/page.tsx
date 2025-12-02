"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

type Evento = {
  movimento: "ENTRADA" | "SAIDA";
  sensor: string | null;
  valor: number;
  criado_em: string;
};

export default function RelatoriosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [animate, setAnimate] = useState(false);

  const [status, setStatus] = useState("offline");
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [ocupacaoMax, setOcupacaoMax] = useState(0);
  const [horarioPico, setHorarioPico] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("—");

  // FILTRO
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  // ---------------------------
  // ANIMAÇÃO INICIAL
  // ---------------------------
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ---------------------------
  // STATUS DO ESP32
  // ---------------------------
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


  // ---------------------------
  // BUSCA EVENTOS DO SUPABASE
  // ---------------------------
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/eventos", { cache: "no-store" });
      const data: Evento[] = await res.json();

      setEventos(data);

      if (data.length > 0) {
        const d = new Date(data[0].criado_em);
        setUltimaAtualizacao(d.toLocaleString("pt-BR"));
      }
    }

    load();
  }, []);

  // ---------------------------
  // FILTRAGEM POR DATA
  // ---------------------------
  const eventosFiltrados = eventos.filter((e) => {
    if (!dataInicio && !dataFim) return true;

    const ts = new Date(e.criado_em).getTime();
    const ini = dataInicio
      ? new Date(dataInicio + "T00:00:00").getTime()
      : -Infinity;
    const fim = dataFim
      ? new Date(dataFim + "T23:59:59").getTime()
      : Infinity;

    return ts >= ini && ts <= fim;
  });

  // ---------------------------
  // KPIs
  // ---------------------------
  useEffect(() => {
    const entradas = eventosFiltrados.filter(
      (e) => e.movimento === "ENTRADA"
    ).length;

    const saidas = eventosFiltrados.filter(
      (e) => e.movimento === "SAIDA"
    ).length;

    setTotalEntradas(entradas);
    setTotalSaidas(saidas);
    setOcupacaoMax(Math.max(...eventosFiltrados.map((e) => e.valor), 0));

    const grupos: Record<string, number> = {};
    eventosFiltrados.forEach((e) => {
      const h = new Date(e.criado_em).getHours();
      grupos[h] = (grupos[h] || 0) + 1;
    });

    const pico = Object.entries(grupos).sort((a, b) => b[1] - a[1])[0];
    setHorarioPico(pico ? pico[0] + "h" : null);
  }, [eventosFiltrados]);

  // ---------------------------
  // GRÁFICOS
  // ---------------------------

  const lineData = {
    labels: eventosFiltrados.map((e) =>
      new Date(e.criado_em).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Ocupação",
        data: eventosFiltrados.map((e) => e.valor),
        borderColor: "#1c3f60",
        backgroundColor: "rgba(28,63,96,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const barrasPorHora = (() => {
    const horas: Record<number, number> = {};

    eventosFiltrados.forEach((e) => {
      const h = new Date(e.criado_em).getHours();
      horas[h] = (horas[h] || 0) + 1;
    });

    const labels = Array.from({ length: 24 }, (_, i) =>
      `${String(i).padStart(2, "0")}h`
    );
    const values = labels.map((_, i) => horas[i] || 0);

    return {
      labels,
      datasets: [
        {
          label: "Movimento",
          data: values,
          backgroundColor: "#1c3f60",
        },
      ],
    };
  })();

  const heatmapGrid = (() => {
    const horas: Record<string, number> = {};
    eventosFiltrados.forEach((e) => {
      const h = String(new Date(e.criado_em).getHours()).padStart(2, "0");
      horas[h] = (horas[h] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, h) => ({
      hora: `${String(h).padStart(2, "0")}h`,
      valor: horas[String(h).padStart(2, "0")] || 0,
    }));
  })();

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: "#f3f6fa" }}
    >
{/* LOGO SUPERIOR */}
<div
  className="w-full flex justify-between items-center px-4 pt-5 pb-3"
  style={{
    backgroundColor: "#f3f6fa", padding: "18px 10px"
    
  }}
>
  {/* Logo */}
  <div
    style={{
      backgroundColor: "#1c3f60",
      padding: "2px 6px",
      borderRadius: "14px",
      boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <img
      src="/img/fluxuss.png"
      alt="Fluxus Logo"
      style={{
        height: "38px",
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  </div>

  {/* STATUS */}
  <span
    style={{
      fontSize: "12px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: status === "online" ? "#22c55e" : "#ef4444",
      marginRight: "6px",
    }}
  >
    <span style={{ fontSize: "11px" }}>●</span>
    {status}
  </span>
</div>

      {/* CARD PRINCIPAL */}
      <div
        className="w-full max-w-3xl mx-auto rounded-3xl shadow-xl transition-all px-6"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dfe6ef",
          padding: "32px 26px",
          marginTop: "18px",
          marginBottom: "26px",
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0px)" : "translateY(20px)",
          transition:
            "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h1
          className="text-l font-extrabold"
          style={{ color: "#1c3f60" }}
        >
          Relatório de Movimentação
        </h1>

        <p className="mt-1 text-sm" style={{ color: "#6b7a86", marginBottom: "15px" }}>
          Análise de fluxo, ocupação e horários de pico.
        </p>

        {/* FILTRO DE DATA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 mb-6">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Data inicial</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 shadow-sm"
            />
          </div>

          {/* BOTÃO LIMPAR */}
          <div className="flex flex-col justify-end text-xs">
            <button
              onClick={() => {
                setDataFim("");
                setDataInicio("")
              }}
              className="px-4 py-2 rounded-md bg-[#1c3f60] text-white font-semibold shadow"
            >
              Limpar filtro
            </button>
          </div>
        </div>

        {/* KPIs  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="px-4 py-3 rounded-xl shadow-sm bg-[#eef2f6] border border-[#d5dde6]">
            <p className="text-xs text-[#6b7a86]">Entradas</p>
            <p className="text-xl font-bold text-[#1c3f60]">{totalEntradas}</p>
          </div>

          <div className="px-4 py-3 rounded-xl shadow-sm bg-[#eef2f6] border border-[#d5dde6]">
            <p className="text-xs text-[#6b7a86]">Saídas</p>
            <p className="text-xl font-bold text-[#1c3f60]">{totalSaidas}</p>
          </div>

          <div className="px-4 py-3 rounded-xl shadow-sm bg-[#eef2f6] border border-[#d5dde6]">
            <p className="text-xs text-[#6b7a86]">Ocupação Máxima</p>
            <p className="text-xl font-bold text-[#1c3f60]">{ocupacaoMax}</p>
          </div>

          <div className="px-4 py-3 rounded-xl shadow-sm bg-[#eef2f6] border border-[#d5dde6]">
            <p className="text-xs text-[#6b7a86]">Pico</p>
            <p className="text-xl font-bold text-[#1c3f60]">
              {horarioPico ?? "—"}
            </p>
          </div>
        </div>

        {/* ==================== ÚLTIMA ATUALIZAÇÃO ==================== */}
        <p className="text-xs mt-3 text-right text-[#6b7a86]">
          Atualizado em: {ultimaAtualizacao}
        </p>

        {/* ==================== GRÁFICO BARRAS ==================== */}
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#1c3f60" }}>
            Movimento por Hora
          </h2>

          <Bar
            data={barrasPorHora}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        {/* ==================== HEATMAP ==================== */}
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1c3f60" }}>
            Mapa de Calor (por hora)
          </h2>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {heatmapGrid.map((h, i) => {
              const intensidade = Math.min(h.valor / 5, 1);
              const bg = `rgba(28,63,96,${0.10 + intensidade * 0.55})`;

              return (
                <div
                  key={i}
                  className="p-2 rounded-lg text-center text-xs font-medium"
                  style={{
                    backgroundColor: bg,
                    color: intensidade > 0.35 ? "#ffffff" : "#1c3f60",
                  }}
                >
                  {h.hora}
                  <br />
                  {h.valor}
                </div>
              );
            })}
          </div>
        </div>
      </div><br></br>

      {/* ==================== NAV MOBILE ==================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 py-3 flex justify-around items-center"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #d7dce2",
          boxShadow: "0 -6px 20px rgba(0,0,0,0.15)",
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
          <svg width="26" height="26" fill="#6b7a86" viewBox="0 0 24 24">
            <path d="M12 7a5 5 0 1 1-4.546 2.916l1.843.793A3 3 0 1 0 12 9V7z" />
          </svg>
          <span className="text-xs" style={{ color: "#6b7a86" }}>
            Contador
          </span>
        </Link>

        <Link href="/relatorios" className="flex flex-col items-center">
          <svg width="26" height="26" fill="#1c3f60" viewBox="0 0 24 24">
            <path d="M3 4h18v2H3V4zm0 6h18v2H3v-2zm0 6h12v2H3v-2z" />
          </svg>
          <span
            className="text-xs"
            style={{ color: "#1c3f60", fontWeight: 700 }}
          >
            Relatórios
          </span>
        </Link>
      </nav>
    </div>
  );
}
