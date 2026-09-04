import { NextResponse } from "next/server";
import { getTrends } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const trends = await getTrends();
  if (!trends) {
    return NextResponse.json(
      { error: "Aucune donnée disponible. Lancez le scraping d'abord." },
      { status: 404 }
    );
  }
  return NextResponse.json(trends);
}
