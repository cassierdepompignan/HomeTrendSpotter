"""
DecoTrends - Script d'analyse des tendances
Agrège les données scrapées pour produire des insights tendance
"""

import json
from pathlib import Path
from collections import Counter
from datetime import datetime

DATA_DIR = Path(__file__).parent / "data"
ARTICLES_FILE = DATA_DIR / "articles.json"
TRENDS_FILE = DATA_DIR / "trends.json"


def load_articles() -> list[dict]:
    if ARTICLES_FILE.exists():
        with open(ARTICLES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def analyze_trends(articles: list[dict]) -> dict:
    """Analyse globale des tendances à partir des articles"""
    keyword_counter = Counter()
    style_counter = Counter()
    material_counter = Counter()
    furniture_counter = Counter()
    tableware_counter = Counter()
    theme_counter = Counter()
    color_mention_counter = Counter()
    source_counter = Counter()
    dominant_color_counter = Counter()

    all_keywords_by_category = {}

    for article in articles:
        keywords = article.get("keywords", {})
        color_mentions = article.get("color_mentions", [])
        source = article.get("source", "Unknown")

        source_counter[source] += 1

        for category, words in keywords.items():
            if category not in all_keywords_by_category:
                all_keywords_by_category[category] = Counter()
            for word in words:
                all_keywords_by_category[category][word] += 1
                keyword_counter[word] += 1

                if category == "styles":
                    style_counter[word] += 1
                elif category == "materiaux":
                    material_counter[word] += 1
                elif category == "meubles":
                    furniture_counter[word] += 1
                elif category == "art_de_la_table":
                    tableware_counter[word] += 1
                elif category == "themes":
                    theme_counter[word] += 1

        for color in color_mentions:
            color_mention_counter[color] += 1

        for color_info in article.get("dominant_colors", []):
            hex_val = color_info.get("hex", "")
            if hex_val:
                dominant_color_counter[hex_val] += 1

    total_articles = len(articles)

    def top_n(counter, n=15):
        return [{"name": k, "count": v, "score": round(v / max(total_articles, 1) * 100, 1)}
                for k, v in counter.most_common(n)]

    trends = {
        "generated_at": datetime.now().isoformat(),
        "total_articles": total_articles,
        "sources": dict(source_counter),
        "top_keywords": top_n(keyword_counter),
        "styles": top_n(style_counter),
        "materials": top_n(material_counter),
        "furniture": top_n(furniture_counter),
        "tableware": top_n(tableware_counter),
        "themes": top_n(theme_counter),
        "color_mentions": top_n(color_mention_counter),
        "dominant_colors": [
            {"hex": hex_val, "count": count}
            for hex_val, count in dominant_color_counter.most_common(20)
        ],
        "all_by_category": {
            cat: dict(counter.most_common(30))
            for cat, counter in all_keywords_by_category.items()
        },
    }

    return trends


def save_trends(trends: dict):
    with open(TRENDS_FILE, "w", encoding="utf-8") as f:
        json.dump(trends, f, ensure_ascii=False, indent=2)


def run_analysis():
    print("📊 Chargement des articles...")
    articles = load_articles()
    print(f"   → {len(articles)} articles chargés")

    if not articles:
        print("⚠️  Aucun article trouvé. Lancez d'abord le scraping:")
        print("   python scripts/scrape.py")
        return

    print("🔍 Analyse des tendances...")
    trends = analyze_trends(articles)
    save_trends(trends)

    print(f"\n✅ Analyse terminée!")
    print(f"   Total articles: {trends['total_articles']}")
    print(f"   Sources: {', '.join(trends['sources'].keys())}")
    print(f"   Top thème: {trends['themes'][0]['name'] if trends['themes'] else 'N/A'}")
    print(f"   Top style: {trends['styles'][0]['name'] if trends['styles'] else 'N/A'}")
    print(f"   Top matériau: {trends['materials'][0]['name'] if trends['materials'] else 'N/A'}")
    print(f"   Top couleur: {trends['color_mentions'][0]['name'] if trends['color_mentions'] else 'N/A'}")

    return trends


if __name__ == "__main__":
    run_analysis()
