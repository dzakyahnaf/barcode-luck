import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateUniqueCode, hashIdentifier, runRNG } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body as { phone?: string };

    // --- Validate input ---
    if (!phone || phone.trim().length < 9) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    // --- Get IP address ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";



    // --- Hash phone for privacy ---
    const identifier = await hashIdentifier(phone);

    const supabase = getSupabaseAdmin();

    // --- Check if already played (DB constraint) ---
    const { data: existing } = await supabase
      .from("scan_entries")
      .select("id, won")
      .eq("identifier", identifier)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error: "Nomor ini sudah pernah bermain sebelumnya.",
          alreadyPlayed: true,
        },
        { status: 409 }
      );
    }

    // --- Run RNG ---
    const winRate = Number(process.env.WIN_RATE_PERCENT ?? 5);

    
    // const { count: currentCount } = await supabase
    //   .from("scan_entries")
    //   .select("*", { count: "exact", head: true });
    // const nextScanNumber = (currentCount ?? 0) + 1;
    // const won = nextScanNumber % 3 === 0 ? true : runRNG(winRate);
    // ⚠️ END TESTING MODE
    const won = runRNG(winRate);

    // --- Insert scan entry ---
    const { data: entry, error: entryError } = await supabase
      .from("scan_entries")
      .insert({
        identifier,
        ip_address: ip,
        won,
      })
      .select("id")
      .single();

    if (entryError || !entry) {
      console.error("DB insert error:", entryError);
      return NextResponse.json(
        { error: "Terjadi kesalahan. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // --- If winner: generate unique code ---
    if (won) {
      let code = "";
      let attempts = 0;

      while (attempts < 5) {
        const candidate = generateUniqueCode();
        const { error: codeError } = await supabase
          .from("winner_codes")
          .insert({
            code: candidate,
            scan_entry_id: entry.id,
          });

        if (!codeError) {
          code = candidate;
          break;
        }
        attempts++;
      }

      if (!code) {
        return NextResponse.json(
          { error: "Gagal menghasilkan kode. Silakan coba lagi." },
          { status: 500 }
        );
      }

      return NextResponse.json({ won: true, code }, { status: 200 });
    }

    // --- If loser: return redirect URL ---
    const redirectUrl =
      process.env.INSTAGRAM_REDIRECT_URL || "https://instagram.com/rakkencoffee";

    return NextResponse.json({ won: false, redirectUrl }, { status: 200 });
  } catch (err) {
    console.error("Spin error:", err instanceof Error ? err.message : err);
    console.error("Env check - SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.error("Env check - SERVICE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.error("Env check - UPSTASH_URL:", !!process.env.UPSTASH_REDIS_REST_URL);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
