import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code || code.length !== 8) {
    return NextResponse.json(
      { error: "Kode tidak valid." },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("winner_codes")
    .select("code, claimed, claimed_at, created_at")
    .eq("code", code)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { valid: false, message: "Kode tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    code: data.code,
    claimed: data.claimed,
    claimedAt: data.claimed_at,
    createdAt: data.created_at,
  });
}
