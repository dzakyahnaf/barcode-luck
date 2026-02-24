"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Copy, CheckCircle, Instagram, Trophy, XCircle, Coffee } from "lucide-react";

// Confetti using warm coffee palette
const CONFETTI_COLORS = [
  "#d4a855", "#c97c2e", "#f0c87a", "#e8a84a",
  "#a05c20", "#fde68a", "#b45309", "#f59e0b",
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

  // ===================== WIN SCREEN =====================
  if (won && code) {
    return (
      <>
        <ConfettiEffect />
        <main
          className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-10"
          style={{ background: "linear-gradient(160deg, #0d0804 0%, #1c1005 50%, #0f0a04 100%)" }}
        >
          <div className="absolute inset-0 bg-dots opacity-50" />
          <div className="absolute inset-0 bg-radial-gold" />
          <div className="absolute top-0 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(212,168,85,0.12), transparent)" }} />
          <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(180,100,30,0.1), transparent)" }} />

          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">

            {/* Trophy */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div
                  className="relative flex items-center justify-center w-28 h-28 rounded-3xl animate-pulse-glow animate-float"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,85,0.3), rgba(180,100,30,0.45))",
                    border: "2px solid rgba(212,168,85,0.5)",
                  }}
                >
                  <Trophy size={52} style={{ color: "#f0c87a" }} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "#c97c2e" }}>
                  ☕ Selamat! Kamu Menang!
                </p>
                <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#fdf4e7" }}>
                  Kamu adalah
                  <span className="block text-glow-gold mt-1" style={{ color: "#f0c87a" }}>
                    Pemenang Beruntung
                  </span>
                </h1>
              </div>
            </div>

            {/* Code Card */}
            <div
              className="glass-card-strong w-full p-6 flex flex-col gap-5"
              style={{ borderColor: "rgba(212,168,85,0.2)" }}
            >
              <div className="flex flex-col gap-3 text-center">
                <p className="text-sm" style={{ color: "#a07850" }}>Kode Pemenang Kamu:</p>
                <div id="winner-code" className="code-display animate-pulse-glow">
                  {code}
                </div>

                <button
                  id="copy-btn"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 mx-auto"
                  style={{
                    background: copied ? "rgba(106,168,79,0.15)" : "rgba(212,168,85,0.1)",
                    border: copied ? "1px solid rgba(106,168,79,0.4)" : "1px solid rgba(212,168,85,0.35)",
                    color: copied ? "#6aa84f" : "#f0c87a",
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
                className="rounded-xl p-4 text-sm leading-relaxed"
                style={{ background: "rgba(255,220,150,0.03)", border: "1px solid rgba(180,120,60,0.1)" }}
              >
                <p className="font-semibold mb-2 flex items-center gap-2" style={{ color: "#fdf4e7" }}>
                  📋 Cara Menukar Hadiah:
                </p>
                <ol className="list-decimal list-inside space-y-1.5" style={{ color: "#a07850" }}>
                  <li>Screenshot halaman ini atau catat kode di atas</li>
                  <li>Tunjukkan kode ke panitia / kasir Rakken Coffee</li>
                  <li>Panitia akan memverifikasi kode secara langsung</li>
                  <li>Hadiah diberikan di tempat setelah verifikasi</li>
                </ol>
              </div>

              <p className="text-center text-xs" style={{ color: "#7a5c3a" }}>
                ⚠️ Kode hanya bisa ditukar <strong style={{ color: "#c4956a" }}>satu kali</strong>. Simpan baik-baik!
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
              <span>Follow @rakkencoffee</span>
            </a>
          </div>
        </main>
      </>
    );
  }

  // ===================== LOSE SCREEN =====================
  return (
    <main
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0d0804 0%, #150c06 50%, #0d0804 100%)" }}
    >
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(140,70,20,0.18) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex items-center justify-center w-24 h-24 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(140,60,20,0.25), rgba(100,40,10,0.35))",
              border: "1px solid rgba(140,80,30,0.3)",
            }}
          >
            <XCircle size={44} style={{ color: "#c0604a" }} />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#8b4a20" }}>
              Belum Beruntung
            </p>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#fdf4e7" }}>
              Kali ini Belum
              <span className="block mt-1" style={{ color: "#a07850" }}>Kamu Menang</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#7a5c3a" }}>
              Jangan sedih! Nikmati kopi kamu dan follow Instagram kami
              untuk info event &amp; giveaway berikutnya.
            </p>
          </div>
        </div>

        <div className="glass-card-strong w-full p-6 flex flex-col items-center gap-5 text-center">
          <Coffee size={40} style={{ color: "#c97c2e" }} />
          <div>
            <p className="font-bold text-lg" style={{ color: "#fdf4e7" }}>Follow @rakkencoffee</p>
            <p className="text-sm mt-1" style={{ color: "#a07850" }}>
              Dapatkan info event, promo, &amp; giveaway kopi terbaru!
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
                style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "99px" }}
              >
                {countdown}s
              </span>
            )}
          </button>

          <p className="text-xs" style={{ color: "#5a3c20" }}>
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
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#0d0804" }}>
        <div className="spinner" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
