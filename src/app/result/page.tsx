"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Copy, CheckCircle, Instagram, Trophy, XCircle } from "lucide-react";

// Confetti colors
const CONFETTI_COLORS = [
  "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#3b82f6",
  "#ec4899", "#06b6d4", "#84cc16",
];

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  shape: "rect" | "circle";
}

function ConfettiEffect() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const generated: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: Math.random() * 100,
      duration: 2.5 + Math.random() * 2.5,
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
    setPieces(generated);
    const t = setTimeout(() => setPieces([]), 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const won = searchParams.get("won") === "true";
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // For losers: auto-redirect to Instagram after countdown
  useEffect(() => {
    if (!won && redirect) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = decodeURIComponent(redirect);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [won, redirect]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleInstagramRedirect = () => {
    if (redirect) window.location.href = decodeURIComponent(redirect);
  };

  if (won && code) {
    return (
      <>
        <ConfettiEffect />
        <main className="relative min-h-screen overflow-hidden bg-[#080a0f] flex flex-col items-center justify-center px-4 py-10">
          <div className="absolute inset-0 bg-dots opacity-40" />
          <div className="absolute inset-0 bg-radial-gold" />
          <div className="absolute top-0 -right-32 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">
            {/* Trophy */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="relative flex items-center justify-center w-28 h-28 rounded-3xl animate-pulse-glow animate-float"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.4))",
                  border: "2px solid rgba(245,158,11,0.5)",
                }}
              >
                <Trophy size={52} className="text-yellow-300" />
              </div>

              <div>
                <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-2">
                  🎉 Selamat! Kamu Menang!
                </p>
                <h1 className="text-3xl font-extrabold text-white leading-tight">
                  Kamu adalah
                  <span className="block text-yellow-300 text-glow-gold mt-1">Pemenang Beruntung</span>
                </h1>
              </div>
            </div>

            {/* Code Card */}
            <div
              className="glass-card-strong w-full p-6 flex flex-col gap-5"
              style={{ borderColor: "rgba(245,158,11,0.2)" }}
            >
              <div className="flex flex-col gap-3 text-center">
                <p className="text-slate-400 text-sm">Kode Pemenang Kamu:</p>
                <div
                  id="winner-code"
                  className="code-display animate-pulse-glow"
                  style={{ letterSpacing: "0.4em" }}
                >
                  {code}
                </div>

                <button
                  id="copy-btn"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 mx-auto"
                  style={{
                    background: copied
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(245,158,11,0.1)",
                    border: copied
                      ? "1px solid rgba(16,185,129,0.4)"
                      : "1px solid rgba(245,158,11,0.3)",
                    color: copied ? "#10b981" : "#fcd34d",
                    minWidth: "160px",
                  }}
                >
                  {copied ? (
                    <><CheckCircle size={16} /> Tersalin!</>
                  ) : (
                    <><Copy size={16} /> Salin Kode</>
                  )}
                </button>
              </div>

              {/* Redemption instructions */}
              <div
                className="rounded-xl p-4 text-sm text-slate-300 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="font-semibold text-white mb-2 flex items-center gap-2">
                  📋 Cara Menukar Hadiah:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Screenshot halaman ini atau catat kode di atas</li>
                  <li>Tunjukkan kode ke panitia acara / meja hadiah</li>
                  <li>Panitia akan memverifikasi kode secara langsung</li>
                  <li>Hadiah diberikan di tempat setelah verifikasi</li>
                </ol>
              </div>

              <p className="text-center text-slate-500 text-xs">
                ⚠️ Kode hanya bisa ditukar <strong className="text-slate-400">satu kali</strong>. Simpan baik-baik!
              </p>
            </div>

            {/* Follow CTA */}
            <a
              href={redirect ? decodeURIComponent(redirect) : "https://instagram.com/rakkencoffee"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-6 py-3"
              style={{
                background: "linear-gradient(135deg, #833ab4, #e1306c)",
                boxShadow: "0 4px 24px rgba(225,48,108,0.3)",
              }}
            >
              <Instagram size={17} />
              <span>Follow Instagram Kami</span>
            </a>
          </div>
        </main>
      </>
    );
  }

  // === LOSE SCREEN ===
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080a0f] flex flex-col items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(239,68,68,0.12) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex items-center justify-center w-24 h-24 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.3))",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <XCircle size={44} className="text-red-400" />
          </div>

          <div>
            <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-2">
              Belum Beruntung
            </p>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Kali ini Belum
              <span className="block text-slate-400 mt-1">Kamu Menang</span>
            </h1>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed max-w-xs mx-auto">
              Jangan sedih! Ikuti Instagram kami untuk info hadiah &amp; event berikutnya.
            </p>
          </div>
        </div>

        <div className="glass-card-strong w-full p-6 flex flex-col items-center gap-5 text-center">
          <div className="text-4xl">📸</div>
          <div>
            <p className="text-white font-bold text-lg">Follow Instagram Kami</p>
            <p className="text-slate-400 text-sm mt-1">
              Dapatkan info event, promo, &amp; giveaway terbaru!
            </p>
          </div>

          <button
            id="instagram-btn"
            onClick={handleInstagramRedirect}
            className="btn-primary w-full"
            style={{
              background: "linear-gradient(135deg, #833ab4, #e1306c)",
              boxShadow: "0 4px 24px rgba(225,48,108,0.3)",
            }}
          >
            <Instagram size={18} />
            <span>Follow Sekarang</span>
            {countdown > 0 && (
              <span
                className="ml-auto text-xs opacity-70 font-normal"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {countdown}s
              </span>
            )}
          </button>

          <p className="text-slate-600 text-xs">
            Akan otomatis redirect dalam {countdown > 0 ? countdown : 0} detik...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
