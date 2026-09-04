import { NextRequest, NextResponse } from "next/server";
import { getTrends } from "@/lib/data";

export const dynamic = "force-dynamic";

function getTrendContext(): string {
  const trends = getTrends() as any;
  if (!trends) return "Pas de données de tendances disponibles.";

  let ctx = "DONNEES TENDANCES ACTUELLES:\n";

  if (trends.styles?.length) {
    ctx += `\nStyles: ${trends.styles.slice(0, 8).map((s: any) => `${s.name} (${s.count}x)`).join(", ")}`;
  }
  if (trends.materials?.length) {
    ctx += `\nMateriaux: ${trends.materials.slice(0, 8).map((m: any) => `${m.name} (${m.count}x)`).join(", ")}`;
  }
  if (trends.color_mentions?.length) {
    ctx += `\nCouleurs tendance: ${trends.color_mentions.slice(0, 8).map((c: any) => `${c.name} (${c.count}x)`).join(", ")}`;
  }
  if (trends.themes?.length) {
    ctx += `\nThemes: ${trends.themes.slice(0, 8).map((t: any) => `${t.name} (${t.count}x)`).join(", ")}`;
  }
  if (trends.furniture?.length) {
    ctx += `\nMeubles: ${trends.furniture.slice(0, 5).map((f: any) => `${f.name} (${f.count}x)`).join(", ")}`;
  }

  return ctx;
}

const DECO_RESPONSES: Record<string, string[]> = {
  couleur: [
    "D'apres les donnees actuelles, les couleurs les plus tendance sont le terracotta, l'ocre et la sauge. Ces teintes terreuses dominent les palettes des magazines de decoration.",
    "Le velours bordeaux, le vert forêt et le bleu petrole sont les couleurs phares de la saison. Elles s'integrent parfaitement dans un salon cosy.",
    "Les couleurs chaudes et rassurantes sont a la mode : beige, lin, ocre pale. Elles creent une atmosphere apaisante et intemporelle.",
    "Le magnolia et le camel dominent les palettes luxe. Ces couleurs neutres permettent de jouer avec les textures.",
  ],
  style: [
    "Le japonandi mélange minimalisme japonais et chaleur scandinave. Utilisez du bois clair, des lignes simples et des tons neutres.",
    "Le wabi-sabi celebre l'imperfection. Pensez terre cuite brute, lin froissé, bois non traite. C'est l'art de la simplicite.",
    "L'art deco revisité mélange géométrie et luxe. Laiton doré, marbre noir et motifs graphiques sont vos alliés.",
    "Le quiet luxury (luxe discret) privilégie les materiaux nobles sans ostentation. Velours, noyer massif, lin italien.",
  ],
  materiau: [
    "Le bois (chêne, noyer) reste incontournable. Il apporte chaleur et authenticité a tout interieur.",
    "Le velours est en pleine renaissance. Il fonctionne sur canapés, coussins ou rideaux pour un effet cocooning.",
    "Le marbre et le travertin dominent pour les plans de travail et les accessoires. Elégance et durabilité.",
    "Le rotin et le raphia apportent une touche naturelle et mediterraneenne. Parfait pour un style bohème chic.",
    "Les materiaux bruts (béton, pierre, métal brossé) créent des espaces contemporains et authentiques.",
  ],
  meuble: [
    "L'îlot de cuisine est le cœur névralgique de la maison moderne. Marbre, noyer et laiton pour un rendu premium.",
    "Le canapé boucle est LE must du moment. Choisissez-le dans des tons neutres (lin, camel) pour intemporelité.",
    "Les étagères murales en métal et bois créent du rangement design tout en légèreté.",
    "La console d'entrée est un piece maîtresse. Elle accueille un miroir et un luminaire pour créer un premier effet.",
  ],
  chambre: [
    "Pour une chambre zen, pensez日本仓 : literie basse, lin naturel, lumière tamisée, tons beige et bois.",
    "Une tête de lit velours dans un ton profond (bordeaux, petrole) transforme instantanément une chambre.",
    "Les draps en lin lavé sont à la mode. Ils donnent un aspect relaxé et luxueux en même temps.",
  ],
  salon: [
    "Le salon est la pièce reine. Un canapé ample en velours, une table basse en marbre, et un luminaire design.",
    "Pour un salon cosy, superposez les textures : tapis laine, coussins boucle, couverture cachemire.",
    "Les tonalités chaudes (terracotta, ocre, sauge) créent une ambiance accueillante pour le salon.",
  ],
  cuisine: [
    "La cuisine moderne favorise le plan en pierre naturelle et les meubles bois massif. Robinetterie cuivre ou laiton.",
    "Les rangements ouverts en bois et métal donnent un air industriel chic à la cuisine.",
    "Un carrelage Zellige ou une faïence artisanale apportent du caractère à une cuisine.",
  ],
  entree: [
    "L'entrée est la carte de visite de votre maison. Un miroir plein cadre, une console élégante et un luminaire design.",
    "Un tapis d'entrée en jute ou sisal est à la fois fonctionnel et esthétique. Il accueille avec charme.",
  ],
  salon_etage: [
    "Le salon à l'étage peut devenir un refuge intime. Pensez coin lecture avec fauteuil, lampe et étagère.",
    "Un bureau à domicile bien pensé nécessite une bonne chaise ergonomique et un éclairage de qualité.",
  ],
};

function findResponse(message: string): string {
  const msg = message.toLowerCase();

  for (const [topic, responses] of Object.entries(DECO_RESPONSES)) {
    if (msg.includes(topic)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  if (msg.includes("couleur") || msg.includes("teinte") || msg.includes("palette")) {
    return DECO_RESPONSES.couleur[Math.floor(Math.random() * DECO_RESPONSES.couleur.length)];
  }
  if (msg.includes("style") || msg.includes("ambiance") || msg.includes("mood")) {
    return DECO_RESPONSES.style[Math.floor(Math.random() * DECO_RESPONSES.style.length)];
  }
  if (msg.includes("matériau") || msg.includes("texture") || msg.includes("velours") || msg.includes("bois")) {
    return DECO_RESPONSES.materiau[Math.floor(Math.random() * DECO_RESPONSES.materiau.length)];
  }
  if (msg.includes("meuble") || msg.includes("canapé") || msg.includes("table")) {
    return DECO_RESPONSES.meuble[Math.floor(Math.random() * DECO_RESPONSES.meuble.length)];
  }

  const trends = getTrends() as any;
  const topStyle = trends?.styles?.[0]?.name || "contemporain";
  const topColor = trends?.color_mentions?.[0]?.name || "terracotta";
  const topMaterial = trends?.materials?.[0]?.name || "bois";

  return `D'après nos analyses de ${trends?.total_articles || 0} articles, le style ${topStyle} est très tendance en ce moment. Les couleurs comme le ${topColor} dominent les palettes, et le ${topMaterial} reste incontournable dans les matériaux. Souhaitez-vous des conseils sur un aspect précis de la décoration ?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages || [];
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const trendContext = getTrendContext();
    const response = findResponse(lastUserMessage);

    return NextResponse.json({
      reply: response,
      trend_context: trendContext,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
