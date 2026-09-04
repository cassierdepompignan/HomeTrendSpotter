"""
DecoTrends - Script de scraping de magazines déco (v2)
Scrape les articles et extrait les couleurs dominantes + mots-clés
Anti-bot amélioré + nouvelles sources
"""

import requests
from bs4 import BeautifulSoup
from colorthief import ColorThief
from fake_useragent import UserAgent
import json
import os
import re
import hashlib
import time
import random
from datetime import datetime
from io import BytesIO
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

ARTICLES_FILE = DATA_DIR / "articles.json"
ua = UserAgent()

DECO_KEYWORDS = {
    "styles": [
        "scandinave", "nordique", "bohème", "bohemien", "minimaliste", "minimalisme",
        "industriel", "industrial", "mid-century", "midcentury", "contemporain",
        "rustique", "baroque", "art deco", "art déco", "japandi", "wabi-sabi",
        "colonial", "provençal", "méridional", "cosmopolite", "luxe",
        "campagne", "château", "bastide", "mas", "villa", "coastal", "coastalgrandmillennial",
        "grandmillennial", "dark academia", "quiet luxury", "organic modern", "warm minimal",
        "parisian", "farmhouse", "cottagecore", "coquette", "y2k", "retro", "vintage",
        "mid-century modern", "scandinavian", "bohemian", "modern luxury", "art nouveau",
        "craftsman", "artcrafts", "verre dichroïque", "néo-historique", "neo-historique",
    ],
    "couleurs": [
        "terracotta", "terre cuite", "ocre", "sable", "beige", "lin",
        "blanc", "noir", "vert", "bleu", "rose", "corail", "jaune",
        "lavande", "mauve", "bordeaux", "brique", "saumon", "pistache",
        "menthe", "ocean", "ciel", "acier", "graphite", "anthracite",
        "camel", "cognac", "moutarde", "safran", "curcuma", "magnolia",
        "sauge", "olive", "kaki", "emeraude", "turquoise", "petrole",
        "noisette", "Brun", "Rouge", "Bleu nuit", "Vert forêt", "vert olive",
        "Brun-rouge", "Rouge brique", "Brun foncé", "Beige chaud", "Blanc cassé",
        "Gris perle", "Noir mat", "Bleu canard", "Rose poudré", "Vert sauge",
        "Terre cuite brûlé", "Rouge cerise", "Bleu roi", "Or", "Argent",
        "Cuivre", "Laiton", "Chrome",
    ],
    "materiaux": [
        "bois", "chêne", "noyer", "pin", "bamboo", "bambou", "rotin",
        "rattan", "marbre", "granit", "travertin", "pierre", "béton",
        "métal", "laiton", "cuivre", "acier", "chrome", "velours",
        "lin", "coton", "soie", "laine", "jute", "sisal", "pierre",
        "céramique", "faïence", "terre cuite", "verre", "osier",
        "brut", "brossé", "poncé", "vernissé", "mat", "lacet",
        "liège", "formica", "résine", "fibre", "mousse", "laine de verre",
        "coton bouclette", "lin lavé", "velours côtelé", "tissage", "tressage",
        "tonus", "grès", "stuc", "enduit", "stucco", "bouillon", "damassé",
        "brocart", "métallisé", "iridescent",
    ],
    "meubles": [
        "canapé", "fauteuil", "chaise", "table", "bureau", "étagère",
        "armoire", "commode", "buffet", "table basse", "console",
        "lit", "tête de lit", "chevet", "miroir", "lampadaire",
        "suspendu", "plan de travail", "îlot", "bibliothèque",
        "pouf", "ottomane", "bergère", "causeuse", "méridienne",
        "lit de jour", "chaise longue", "transat", "hamac",
        "vitrine", "mezzo", "meuble de rangement", "rangement mural",
        "table de nuit", "table de chevet", "table basse rond",
        "table à manger", "table d'appoint", "table de salon",
        "table de cuisine", "table de bureau", "bureau d'écriture",
        "bureau debout", "secrétaire", "boudoir", "ottomane",
        "tabouret", "banc", "chaise de bar", "perchoir",
    ],
    "art_de_la_table": [
        "vaisselle", "couvert", "verre", "carafe", "bougeoir",
        "nappe", "serviette", "chandelier", "centrepiece", "salière",
        "poivrière", "plateau", "mezzo", "cake stand", "sous-verre",
        "verre à pied", "coupe", "bol", "assiette", "soupière",
        "théière", "cafetière", "moulin", "saladier", "corbeille",
        "porte-bouteille", "décanteur", "carafon", "flûte",
        "coupe de champagne", "verre à vin", "verre à digestif",
        "porte-nappe", "chemin de table", "servante",
    ],
    "themes": [
        "biophilie", "biophilic", "végétal", "plante", "jardin",
        "artisanat", "fait main", "upcycling", "circulaire",
        "lumière naturelle", "luminosité", "espace", "volumétrie",
        "texture", "contraste", "symétrie", "asymétrie", "géométrie",
        "luxe discret", "quiet luxury", "dopamine", "comfortcore",
        "cottagecore", "coastal", "mediterranean", "britannique",
        "sensorialité", "sensorial", "sensoriel", "sensorialité",
        "transformisme", "patrimoine", "héritage", "artisanal",
        "durabilité", "responsable", "écoresponsable", "circulaire",
        "bien-être", "wellness", "cocon", "refuge", "sanctuaire",
        "luxe accessible", "artisanat", "métiers d'art", "savoir-faire",
        "matière noble", "authenticité", "sincérité", "sobriété",
        "lumière d'ambiance", "lumière couches", "éclairage indirect",
        "mousse", "mural", "papier peint", "fresque", "motif",
        "gribouillage", "naïf", "imparfait", "brut", "naturel",
    ]
}


def get_session():
    """Session avec headers anti-bot robustes"""
    session = requests.Session()
    session.headers.update({
        "User-Agent": ua.random,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
        "Sec-CH-UA": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
    })
    return session


def fetch_with_retry(session, url, max_retries=3, **kwargs):
    """Requête avec retry et backoff exponentiel"""
    for attempt in range(max_retries):
        try:
            resp = session.get(url, timeout=kwargs.pop("timeout", 20), **kwargs)
            resp.raise_for_status()
            return resp
        except Exception as e:
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 1)
                time.sleep(wait)
            else:
                raise


def extract_colors_from_image(url: str, session: requests.Session) -> list[dict]:
    """Extrait les couleurs dominantes d'une image"""
    try:
        resp = fetch_with_retry(session, url, timeout=10)
        ct = ColorThief(BytesIO(resp.content))
        palette = ct.get_palette(color_count=5, quality=1)
        return [{"hex": f"#{r:02x}{g:02x}{b:02x}", "rgb": (r, g, b)} for r, g, b in palette]
    except Exception:
        return []


def extract_keywords(text: str) -> dict[str, list[str]]:
    """Extrait les mots-clés déco d'un texte"""
    text_lower = text.lower()
    found = {}
    for category, keywords in DECO_KEYWORDS.items():
        matches = [kw for kw in keywords if kw in text_lower]
        if matches:
            found[category] = list(set(matches))
    return found


def extract_color_mentions(text: str) -> list[str]:
    """Extrait les couleurs mentionnées dans le texte"""
    text_lower = text.lower()
    return [c for c in DECO_KEYWORDS["couleurs"] if c in text_lower]


def extract_article_from_soup(card, base_url: str) -> dict | None:
    """Extrait un article depuis un élément BeautifulSoup"""
    link = card.find("a", href=True)
    title_el = card.find(["h1", "h2", "h3", "h4"]) or card.find("a")
    img_el = card.find("img")

    if not link or not title_el:
        return None

    title = title_el.get_text(strip=True)
    if len(title) < 5:
        return None

    url = link["href"]
    if not url.startswith("http"):
        url = base_url.rstrip("/") + "/" + url.lstrip("/")

    img_url = ""
    if img_el:
        img_url = img_el.get("src") or img_el.get("data-src") or img_el.get("data-lazy-src") or ""

    return {
        "title": title,
        "url": url,
        "image_url": img_url,
        "scraped_at": datetime.now().isoformat(),
    }


def scrape_elle_deco(session: requests.Session) -> list[dict]:
    """Scrape les articles de Elle Décoration"""
    articles = []
    base_url = "https://www.elledecoration.fr"
    try:
        resp = fetch_with_retry(session, base_url)
        soup = BeautifulSoup(resp.content, "lxml")

        for card in soup.select("article, .post-card, [class*='article'], [class*='card'], [class*='post']")[:25]:
            article = extract_article_from_soup(card, base_url)
            if article:
                article["source"] = "Elle Décoration"
                articles.append(article)
    except Exception as e:
        print(f"  [Elle Déco] Erreur: {e}")
    return articles


def scrape_cabana(session: requests.Session) -> list[dict]:
    """Scrape les articles de Cabana Magazine"""
    articles = []
    base_url = "https://www.cabana.fr"
    try:
        resp = fetch_with_retry(session, base_url)
        soup = BeautifulSoup(resp.content, "lxml")

        for card in soup.select("article, .post, [class*='article'], [class*='blog'], [class*='card']")[:25]:
            article = extract_article_from_soup(card, base_url)
            if article:
                article["source"] = "Cabana"
                articles.append(article)
    except Exception as e:
        print(f"  [Cabana] Erreur: {e}")
    return articles


def scrape_cote_sud(session: requests.Session) -> list[dict]:
    """Scrape les articles de Côté Sud"""
    articles = []
    base_url = "https://www.cotesud.fr"
    try:
        resp = fetch_with_retry(session, base_url)
        soup = BeautifulSoup(resp.content, "lxml")

        for card in soup.select("article, .post, [class*='article'], [class*='card']")[:25]:
            article = extract_article_from_soup(card, base_url)
            if article:
                article["source"] = "Côté Sud"
                articles.append(article)
    except Exception as e:
        print(f"  [Côté Sud] Erreur: {e}")
    return articles


def scrape_architectural_digest(session: requests.Session) -> list[dict]:
    """Scrape les articles de Architectural Digest France"""
    articles = []
    base_url = "https://www.architecturaldigest.fr"
    try:
        resp = fetch_with_retry(session, base_url)
        soup = BeautifulSoup(resp.content, "lxml")

        for card in soup.select("article, [class*='card'], [class*='article'], [class*='post'], [class*='story']")[:25]:
            article = extract_article_from_soup(card, base_url)
            if article:
                article["source"] = "Architectural Digest"
                articles.append(article)
    except Exception as e:
        print(f"  [AD] Erreur: {e}")
    return articles


def scrape_dezeen(session: requests.Session) -> list[dict]:
    """Scrape les articles de Dezeen (design & architecture)"""
    articles = []
    base_url = "https://www.dezeen.com"
    try:
        resp = fetch_with_retry(session, base_url)
        soup = BeautifulSoup(resp.content, "lxml")

        for card in soup.select("article, [class*='card'], [class*='article'], [class*='post'], [class*='listing']")[:25]:
            article = extract_article_from_soup(card, base_url)
            if article:
                article["source"] = "Dezeen"
                articles.append(article)
    except Exception as e:
        print(f"  [Dezeen] Erreur: {e}")
    return articles


def scrape_article_content(url: str, session: requests.Session) -> str:
    """Scrape le contenu textuel d'un article pour analyse NLP"""
    try:
        resp = fetch_with_retry(session, url, timeout=15)
        soup = BeautifulSoup(resp.content, "lxml")

        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
            tag.decompose()

        article = soup.find("article") or soup.find("main") or soup.find("[class*='content']") or soup.body
        if article:
            return article.get_text(separator=" ", strip=True)[:2000]
    except Exception:
        pass
    return ""


def deduplicate(articles: list[dict]) -> list[dict]:
    """Supprime les doublons basés sur l'URL"""
    seen = set()
    unique = []
    for a in articles:
        url_hash = hashlib.md5(a["url"].encode()).hexdigest()
        if url_hash not in seen:
            seen.add(url_hash)
            unique.append(a)
    return unique


def load_existing_articles() -> list[dict]:
    """Charge les articles déjà scrapés"""
    if ARTICLES_FILE.exists():
        with open(ARTICLES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_articles(articles: list[dict]):
    """Sauvegarde les articles en JSON"""
    with open(ARTICLES_FILE, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)


def run_scrape():
    """Lance le scraping complet"""
    session = get_session()
    all_articles = []

    scrapers = [
        ("Elle Décoration", scrape_elle_deco),
        ("Cabana", scrape_cabana),
        ("Côté Sud", scrape_cote_sud),
        ("Architectural Digest", scrape_architectural_digest),
        ("Dezeen", scrape_dezeen),
    ]

    for name, scraper in scrapers:
        print(f"  Scraping {name}...")
        articles = scraper(session)
        print(f"   -> {len(articles)} articles trouves")
        all_articles.extend(articles)
        time.sleep(random.uniform(1, 3))

    all_articles = deduplicate(all_articles)
    print(f"\n  Total: {len(all_articles)} articles uniques")

    print("  Analyse du contenu des articles...")
    for i, article in enumerate(all_articles):
        content = scrape_article_content(article["url"], session)
        article["content_preview"] = content[:500] if content else ""
        article["keywords"] = extract_keywords(article["title"] + " " + content)
        article["color_mentions"] = extract_color_mentions(article["title"] + " " + content)

        if article.get("image_url"):
            article["dominant_colors"] = extract_colors_from_image(article["image_url"], session)
        else:
            article["dominant_colors"] = []

        if (i + 1) % 5 == 0:
            print(f"   Analyse {i + 1}/{len(all_articles)}")

    existing = load_existing_articles()
    existing_urls = {a["url"] for a in existing}
    new_articles = [a for a in all_articles if a["url"] not in existing_urls]
    all_articles = existing + new_articles

    save_articles(all_articles)
    print(f"\n  Sauvegarde: {len(all_articles)} articles total ({len(new_articles)} nouveaux)")

    return all_articles


if __name__ == "__main__":
    run_scrape()
