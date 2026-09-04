"use client";

import { useEffect, useState } from "react";
import type { TrendsData } from "@/lib/data";

function TrendBar({ name, score, maxScore }: { name: string; score: number; maxScore: number }) {
  const width = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-32 text-sm font-medium text-zinc-700 truncate">{name}</span>
      <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-12 text-xs text-zinc-500 text-right">{score}%</span>
    </div>
  );
}

function ColorSwatch({ hex, count }: { hex: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-xl shadow-md border border-zinc-200 hover:scale-110 transition-transform cursor-pointer"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <span className="text-[10px] text-zinc-400 font-mono">{hex}</span>
      <span className="text-[10px] text-zinc-500">{count}x</span>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-zinc-900">{value}</div>
      <div className="text-sm text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => {
        if (!r.ok) throw new Error("Données non disponibles");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-400 text-lg">Chargement des tendances...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">📊</div>
        <h2 className="text-xl font-semibold text-zinc-700">Aucune donnée disponible</h2>
        <p className="text-zinc-500 text-center max-w-md">
          Lancez le scraping depuis la page d&apos;accueil pour collecter et analyser les tendances déco.
        </p>
      </div>
    );
  }

  const maxStyle = data.styles[0]?.score || 1;
  const maxMaterial = data.materials[0]?.score || 1;
  const maxTheme = data.themes[0]?.score || 1;
  const maxColor = data.color_mentions[0]?.score || 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Tendances Découvertes</h1>
        <p className="text-zinc-500 mt-1">
          Analyse de {data.total_articles} articles • Mis à jour le{" "}
          {new Date(data.generated_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Articles analysés" value={data.total_articles} icon="📰" />
        <StatCard label="Styles identifiés" value={data.styles.length} icon="🎨" />
        <StatCard label="Matériaux suivis" value={data.materials.length} icon="🪵" />
        <StatCard label="Sources" value={Object.keys(data.sources).length} icon="🌐" />
      </div>

      {/* Couleurs tendance */}
      {data.dominant_colors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">🎨 Couleurs Dominantes</h2>
          <div className="flex flex-wrap gap-4">
            {data.dominant_colors.map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} count={c.count} />
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Styles */}
        {data.styles.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">🏠 Styles</h2>
            {data.styles.map((s) => (
              <TrendBar key={s.name} name={s.name} score={s.score} maxScore={maxStyle} />
            ))}
          </section>
        )}

        {/* Matériaux */}
        {data.materials.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">🪵 Matériaux</h2>
            {data.materials.map((m) => (
              <TrendBar key={m.name} name={m.name} score={m.score} maxScore={maxMaterial} />
            ))}
          </section>
        )}

        {/* Thèmes */}
        {data.themes.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">💡 Thèmes</h2>
            {data.themes.map((t) => (
              <TrendBar key={t.name} name={t.name} score={t.score} maxScore={maxTheme} />
            ))}
          </section>
        )}

        {/* Couleurs mentionnées */}
        {data.color_mentions.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">🌈 Couleurs Citées</h2>
            {data.color_mentions.map((c) => (
              <TrendBar key={c.name} name={c.name} score={c.score} maxScore={maxColor} />
            ))}
          </section>
        )}
      </div>

      {/* Meubles */}
      {data.furniture.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">🛋️ Meubles Tendance</h2>
          <div className="flex flex-wrap gap-3">
            {data.furniture.map((f) => (
              <span
                key={f.name}
                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100"
              >
                {f.name} <span className="text-amber-400 ml-1">{f.count}x</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Art de la table */}
      {data.tableware.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">🍽️ Art de la Table</h2>
          <div className="flex flex-wrap gap-3">
            {data.tableware.map((t) => (
              <span
                key={t.name}
                className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium border border-rose-100"
              >
                {t.name} <span className="text-rose-400 ml-1">{t.count}x</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">🌐 Sources</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.sources).map(([name, count]) => (
            <span
              key={name}
              className="px-4 py-2 bg-zinc-50 text-zinc-700 rounded-full text-sm font-medium border border-zinc-200"
            >
              {name} <span className="text-zinc-400 ml-1">{count} articles</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
