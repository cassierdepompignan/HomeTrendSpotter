-- DecoTrends - Schema Supabase
-- Copiez ce script dans l'editeur SQL de votre dashboard Supabase

-- Table des articles scrapes
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  image_url TEXT,
  content_preview TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  keywords JSONB DEFAULT '{}',
  color_mentions TEXT[] DEFAULT '{}',
  dominant_colors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des tendances generees
CREATE TABLE IF NOT EXISTS trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at TIMESTAMPTZ DEFAULT now(),
  total_articles INTEGER DEFAULT 0,
  sources JSONB DEFAULT '{}',
  styles JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  furniture JSONB DEFAULT '[]',
  tableware JSONB DEFAULT '[]',
  themes JSONB DEFAULT '[]',
  color_mentions JSONB DEFAULT '[]',
  dominant_colors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_scraped_at ON articles(scraped_at);
CREATE INDEX IF NOT EXISTS idx_trends_generated_at ON trends(generated_at);

-- Politique RLS (Row Level Security) - lecture publique, ecriture authentifiee
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Lecture publique articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Lecture publique trends" ON trends FOR SELECT USING (true);

-- Ecriture (a configurer selon votre auth)
-- Pour l'instant, on desactive RLS pour le developpement
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE trends DISABLE ROW LEVEL SECURITY;
