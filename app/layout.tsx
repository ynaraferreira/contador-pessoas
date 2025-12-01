import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contador de Pessoas",
  description: "Monitoramento em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>

      <body className="bg-animated min-h-screen flex flex-col">
        {/* NAV */}
        <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-lg">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-10">

            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-white hover:opacity-90"
            >
              Início
            </Link>

            <div className="flex items-center gap-8 text-lg">
              <Link
                href="/contador"
                className="text-slate-300 hover:text-white transition font-medium"
              >
                Contador
              </Link>

              <Link
                href="/relatorios"
                className="text-slate-300 hover:text-white transition font-medium"
              >
                Relatórios
              </Link>
            </div>

            <Link
              className="ml-auto text-red-400 hover:text-red-300 font-medium"
              href="/logout"
            >
              Sair
            </Link>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1 flex justify-center items-center px-6 py-16">
          <div className="w-full max-w-5xl">{children}</div>
        </main>

        {/* SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
