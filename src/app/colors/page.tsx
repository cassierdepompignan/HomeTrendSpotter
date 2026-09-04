"use client";

import { useEffect, useState } from "react";
import type { TrendsData } from "@/lib/data";

function ColorCard({ hex, count, total }: { hex: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return (
    <div className="group cursor-pointer">
      <div
        className="w-full aspect-square rounded-2xl shadow-md border border-zinc-200 group-hover:scale-105 transition-transform duration-200 flex items-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span
          className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded"
          style={{ color: luminance > 0.5 ? "#000" : "#fff" }}
        >
          {hex}
        </span>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-zinc-700">{pct}%</div>
        <div className="text-xs text-zinc-400">{count} mentions</div>
      </div>
    </div>
  );
}

function ColorMentionCard({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-100 hover:shadow-md transition-shadow">
      <div
        className="w-10 h-10 rounded-lg shadow-sm border border-zinc-200"
        style={{ backgroundColor: getColorHex(name) }}
      />
      <div className="flex-1">
        <div className="font-medium text-zinc-800 capitalize">{name}</div>
        <div className="text-sm text-zinc-500">{count} articles</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-amber-600">{pct}%</div>
      </div>
    </div>
  );
}

function getColorHex(name: string): string {
  const map: Record<string, string> = {
    terracotta: "#C2452D",
    "terre cuite": "#C2452D",
    ocre: "#CC7722",
    sarge: "#C3B091",
    beige: "#F5F5DC",
    lin: "#FAF0E6",
    blanc: "#FFFFFF",
    noir: "#1A1A1A",
    vert: "#2D5A27",
    bleu: "#1E3A5F",
    rose: "#FFB6C1",
    corail: "#FF6F61",
    jaune: "#F5C518",
    lavande: "#B57EDC",
    mauve: "#8B6DAF",
    bordeaux: "#722F37",
    brique: "#CB4154",
    saumon: "#FA8072",
    pistache: "#93C572",
    menthe: "#98FF98",
    ocean: "#4F97A3",
    ciel: "#87CEEB",
    acier: "#71797E",
    graphite: "#383838",
    anthracite: "#2D2D2D",
    camel: "#C19A6B",
    cognac: "#9A3324",
    moutarde: "#FFDB58",
    safran: "#F4C430",
    curcuma: "#E8B004",
    magnolia: "#F8EDCF",
    sauge: "#B2AC88",
    olive: "#808000",
    kaki: "#C3B091",
    emeraude: "#50C878",
    turquoise: "#40E0D0",
    petrole: "#005F69",
  };
  return map[name.toLowerCase()] || "#9CA3AF";
}

export default function ColorsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-400 text-lg">Chargement des couleurs...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🎨</div>
        <h2 className="text-xl font-semibold text-zinc-700">Aucune donnée</h2>
        <p className="text-zinc-500">Lancez le scraping pour voir les couleurs tendance.</p>
      </div>
    );
  }

  const totalMentions = data.color_mentions.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">🎨 Couleurs Tendance</h1>
        <p className="text-zinc-500 mt-1">
          Palette extraite de {data.total_articles} articles déco
        </p>
      </div>

      {/* Dominant colors palette */}
      {data.dominant_colors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-800 mb-6">Palette Dominante</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
            {data.dominant_colors.map((c) => (
              <ColorCard key={c.hex} hex={c.hex} count={c.count} total={data.dominant_colors.reduce((a, x) => a + x.count, 0)} />
            ))}
          </div>
        </section>
      )}

      {/* Color gradient preview */}
      {data.dominant_colors.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-800 mb-6">Dégradé Tendance</h2>
          <div
            className="h-24 rounded-2xl shadow-lg"
            style={{
              background: `linear-gradient(90deg, ${data.dominant_colors.map((c, i) => `${c.hex} ${(i / (data.dominant_colors.length - 1)) * 100}%`).join(", ")})`,
            }}
          />
        </section>
      )}

      {/* Mentioned colors */}
      {data.color_mentions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-zinc-800 mb-6">Couleurs Citées dans les Articles</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.color_mentions.map((c) => (
              <ColorMentionCard key={c.name} name={c.name} count={c.count} total={totalMentions} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
