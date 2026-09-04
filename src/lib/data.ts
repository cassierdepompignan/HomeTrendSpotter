import { getArticlesFromDB, getLatestTrends } from "./db";

export interface Article {
  title: string;
  url: string;
  source: string;
  image_url: string;
  scraped_at: string;
  content_preview: string;
  keywords: Record<string, string[]>;
  color_mentions: string[];
  dominant_colors: { hex: string; rgb: number[] }[];
}

export interface TrendItem {
  name: string;
  count: number;
  score: number;
}

export interface TrendsData {
  generated_at: string;
  total_articles: number;
  sources: Record<string, number>;
  top_keywords: TrendItem[];
  styles: TrendItem[];
  materials: TrendItem[];
  furniture: TrendItem[];
  tableware: TrendItem[];
  themes: TrendItem[];
  color_mentions: TrendItem[];
  dominant_colors: { hex: string; count: number }[];
  all_by_category: Record<string, Record<string, number>>;
}

export async function getArticles(): Promise<Article[]> {
  return getArticlesFromDB();
}

export async function getTrends(): Promise<TrendsData | null> {
  return getLatestTrends();
}
