/**
 * DecoTrends - Data persistence layer
 * Utilise Supabase quand configure, sinon fallback sur JSON local
 */

import fs from "fs/promises";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "scripts", "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const TRENDS_FILE = path.join(DATA_DIR, "trends.json");

// === Articles ===

export async function saveArticle(article: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase
      .from("articles")
      .upsert(article, { onConflict: "url" });
  } else {
    const existing = await loadLocalArticles();
    const idx = existing.findIndex((a: any) => a.url === article.url);
    if (idx >= 0) {
      existing[idx] = article;
    } else {
      existing.push(article);
    }
    await fs.writeFile(ARTICLES_FILE, JSON.stringify(existing, null, 2), "utf-8");
  }
}

export async function getArticlesFromDB(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("scraped_at", { ascending: false });
    return error ? [] : data || [];
  }
  return loadLocalArticles();
}

export async function getArticleCount(): Promise<number> {
  if (isSupabaseConfigured() && supabase) {
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true });
    return count || 0;
  }
  const articles = await loadLocalArticles();
  return articles.length;
}

async function loadLocalArticles(): Promise<any[]> {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// === Trends ===

export async function saveTrends(trends: any): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from("trends").insert({
      generated_at: trends.generated_at,
      total_articles: trends.total_articles,
      sources: trends.sources,
      styles: trends.styles,
      materials: trends.materials,
      furniture: trends.furniture,
      tableware: trends.tableware,
      themes: trends.themes,
      color_mentions: trends.color_mentions,
      dominant_colors: trends.dominant_colors,
    });
  } else {
    await fs.writeFile(TRENDS_FILE, JSON.stringify(trends, null, 2), "utf-8");
  }
}

export async function getLatestTrends(): Promise<any | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("trends")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();
    return error ? null : data;
  }
  return loadLocalTrends();
}

export async function getAllTrendsHistory(): Promise<any[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("trends")
      .select("*")
      .order("generated_at", { ascending: false });
    return error ? [] : data || [];
  }
  const trends = await loadLocalTrends();
  return trends ? [trends] : [];
}

async function loadLocalTrends(): Promise<any | null> {
  try {
    const raw = await fs.readFile(TRENDS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// === Migration helpers ===

export async function migrateLocalToSupabase(): Promise<{ articles: number; trends: number }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configure");
  }

  const localArticles = await loadLocalArticles();
  let articlesCount = 0;

  for (const article of localArticles) {
    const { error } = await supabase
      .from("articles")
      .upsert(article, { onConflict: "url" });
    if (!error) articlesCount++;
  }

  const localTrends = await loadLocalTrends();
  let trendsCount = 0;

  if (localTrends) {
    const { error } = await supabase.from("trends").insert({
      generated_at: localTrends.generated_at,
      total_articles: localTrends.total_articles,
      sources: localTrends.sources,
      styles: localTrends.styles,
      materials: localTrends.materials,
      furniture: localTrends.furniture,
      tableware: localTrends.tableware,
      themes: localTrends.themes,
      color_mentions: localTrends.color_mentions,
      dominant_colors: localTrends.dominant_colors,
    });
    if (!error) trendsCount++;
  }

  return { articles: articlesCount, trends: trendsCount };
}
