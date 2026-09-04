"use client";

import { useEffect, useState } from "react";
import type { TrendsData, TrendItem } from "@/lib/data";

function TablewareCard({ item, maxScore }: { item: TrendItem; maxScore: number }) {
  const width = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-800 capitalize">{item.name}</h3>
        <span className="text-sm font-bold text-rose-600">{item.score}%</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-2">Mentionné {item.count} fois</p>
    </div>
  );
}

export default function TablewarePage() {
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
        <div className="animate-pulse text-zinc-400">Chargement...</div>
      </div>
    );
  }

  const tableware = data?.tableware || [];
  const maxScore = tableware[0]?.score || 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">🍽️ Art de la Table</h1>
        <p className="text-zinc-500 mt-1">
          Vaisselle, couverts et accessoires les plus tendance
        </p>
      </div>

      {tableware.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          Aucune donnée. Lancez le scraping depuis l&apos;accueil.
        </div>
      ) : (
        <>
          {/* Top 5 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-zinc-800 mb-4">⭐ Top 5 Art de la Table</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tableware.slice(0, 5).map((t) => (
                <TablewareCard key={t.name} item={t} maxScore={maxScore} />
              ))}
            </div>
          </section>

          {/* Tous */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-800 mb-4">📋 Tous les articles</h2>
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
              {tableware.map((t, i) => (
                <div
                  key={t.name}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i !== tableware.length - 1 ? "border-b border-zinc-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-400 w-6">{i + 1}</span>
                    <span className="text-sm font-medium text-zinc-700 capitalize">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{ width: `${(t.score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-rose-600 w-12 text-right">{t.score}%</span>
                    <span className="text-xs text-zinc-400 w-12 text-right">{t.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
