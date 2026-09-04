import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "scrape.py");
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
      timeout: 120000,
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      errors: stderr || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
