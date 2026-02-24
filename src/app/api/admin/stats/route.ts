import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [{ count: totalScans }, { count: totalWins }, { count: totalClaimed }] =
    await Promise.all([
      supabase.from("scan_entries").select("*", { count: "exact", head: true }),
      supabase
        .from("scan_entries")
        .select("*", { count: "exact", head: true })
        .eq("won", true),
      supabase
        .from("winner_codes")
        .select("*", { count: "exact", head: true })
        .eq("claimed", true),
    ]);

  const winRate =
    totalScans && totalScans > 0
      ? ((totalWins ?? 0) / totalScans) * 100
      : 0;

  return NextResponse.json({
    totalScans: totalScans ?? 0,
    totalWins: totalWins ?? 0,
    totalClaimed: totalClaimed ?? 0,
    winRateActual: Math.round(winRate * 100) / 100,
  });
}
