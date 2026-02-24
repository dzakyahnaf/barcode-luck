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

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await getSupabaseAdmin()
    .from("winner_codes")
    .select(
      "code, claimed, claimed_at, created_at, scan_entries(ip_address)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ codes: data, total: count, page, pageSize });
}

// POST: mark a code as claimed
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("winner_codes")
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq("code", code.toUpperCase())
    .eq("claimed", false)
    .select("code, claimed")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Kode tidak ditemukan atau sudah diklaim." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, code: data.code });
}
