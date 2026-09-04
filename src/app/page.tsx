"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScrape = async () => {
    setScraping(true);
    setResult(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult("✅ Scraping terminé ! Allez voir la page Tendances.");
      } else {
        setResult("❌ Erreur: " + (data.error || "Inconnue"));
      }
    } catch {
      setResult("❌ Erreur de connexion");
    }
    setScraping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <h1 className="text-xl font-bold text-zinc-900">DecoTrends</h1>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-900 border-b-2 border-amber-500 pb-1">
              Accueil
            </Link>
            <Link href="/trends" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Tendances
            </Link>
            <Link href="/colors" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Couleurs
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Les tendances déco,<br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
              analysées par l&apos;IA
            </span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            DecoTrends scrape et analyse les magazines de décoration pour vous révéler
            les couleurs, styles, matériaux et thèmes qui cartonnent.
          </p>
        </div>

        {/* Sources */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📰</div>
            <h3 className="font-semibold text-zinc-800 mb-1">Elle Décoration</h3>
            <p className="text-sm text-zinc-500">Articles tendance déco intérieure</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">🏛️</div>
            <h3 className="font-semibold text-zinc-800 mb-1">Cabana</h3>
            <p className="text-sm text-zinc-500">Inspiration méditerranéenne & luxe</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">☀️</div>
            <h3 className="font-semibold text-zinc-800 mb-1">Côté Sud</h3>
            <p className="text-sm text-zinc-500">Art de vivre & décoration du sud</p>
          </div>
        </div>

        {/* Scraping CTA */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-zinc-100 text-center">
          <h3 className="text-2xl font-bold text-zinc-900 mb-3">Collecter les données</h3>
          <p className="text-zinc-500 mb-6 max-w-lg mx-auto">
            Lance le scraping pour analyser les derniers articles et générer les insights tendance.
          </p>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scraping ? "🔄 Scraping en cours..." : "🚀 Lancer le Scraping"}
          </button>
          {result && (
            <p className="mt-4 text-sm font-medium">{result}</p>
          )}
        </div>

        {/* Features preview */}
        <div className="mt-16 grid md:grid-cols-4 gap-4">
          <Link href="/trends" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-zinc-800">Tendances</div>
            <div className="text-xs text-zinc-500 mt-1">Styles, matériaux, thèmes</div>
          </Link>
          <Link href="/colors" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-semibold text-zinc-800">Couleurs</div>
            <div className="text-xs text-zinc-500 mt-1">Palette & mentions</div>
          </Link>
          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 border-dashed">
            <div className="text-2xl mb-2 opacity-50">🛋️</div>
            <div className="font-semibold text-zinc-400">Meubles</div>
            <div className="text-xs text-zinc-400 mt-1">Bientôt disponible</div>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 border-dashed">
            <div className="text-2xl mb-2 opacity-50">💬</div>
            <div className="font-semibold text-zinc-400">Chatbot IA</div>
            <div className="text-xs text-zinc-400 mt-1">Bientôt disponible</div>
          </div>
        </div>
      </main>
    </div>
  );
}
