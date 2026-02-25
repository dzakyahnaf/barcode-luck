"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Copy, CheckCircle, Instagram, Trophy, XCircle, Coffee } from "lucide-react";

const CONFETTI_COLORS = [
  "#fcd34d", "#fde68a", "#F2F2F2", "#ffffff",
  "#f59e0b", "#fbbf24", "#E6E6E6", "#d4a855",
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
          style={{ background: "linear-gradient(160deg, #8F0D14 0%, #B5121B 50%, #A60F17 100%)" }}
        >
          <div className="absolute inset-0 bg-dots opacity-40" />
          <div className="absolute inset-0 bg-radial-gold" />
          <div className="absolute top-0 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(0,0,0,0.12), transparent)" }} />
          <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(0,0,0,0.1), transparent)" }} />

          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">

            {/* Trophy */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div
                  className="relative flex items-center justify-center w-28 h-28 rounded-3xl animate-pulse-glow animate-float"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "2px solid rgba(252,211,77,0.5)",
                  }}
                >
                  <Trophy size={52} style={{ color: "#fde68a" }} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}>
                  🎉 Selamat! Kamu Menang!
                </p>
                <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#F2F2F2" }}>
                  Kamu adalah
                  <span className="block text-glow-gold mt-1" style={{ color: "#fde68a" }}>
                    Pemenang Beruntung
                  </span>
                </h1>
              </div>
            </div>

            {/* Code Card */}
            <div
              className="glass-card-strong w-full p-6 flex flex-col gap-5"
              style={{ borderColor: "rgba(252,211,77,0.2)" }}
            >
              <div className="flex flex-col gap-3 text-center">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Kode Pemenang Kamu:</p>
                <div id="winner-code" className="code-display animate-pulse-glow">
                  {code}
                </div>

                <button
                  id="copy-btn"
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    background: copied ? "rgba(106,168,79,0.15)" : "rgba(252,211,77,0.1)",
                    border: copied ? "1px solid rgba(106,168,79,0.4)" : "1px solid rgba(252,211,77,0.35)",
                    color: copied ? "#6aa84f" : "#fde68a",
                    cursor: "pointer",
                    margin: "0 auto",
                    minWidth: "160px",
                    transition: "all 0.2s",
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
                style={{
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#F2F2F2", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📋 Cara Menukar Hadiah:
                </p>
                <ol style={{ listStyleType: "decimal", paddingLeft: "1.25rem", color: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <li>Screenshot halaman ini atau catat kode di atas</li>
                  <li>Tunjukkan kode ke panitia / kasir Rakken Coffee</li>
                  <li>Panitia akan memverifikasi kode secara langsung</li>
                  <li>Hadiah diberikan di tempat setelah verifikasi</li>
                </ol>
              </div>

              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                ⚠️ Kode hanya bisa ditukar <strong style={{ color: "#E6E6E6" }}>satu kali</strong>. Simpan baik-baik!
              </p>
            </div>

            {/* Follow CTA */}
            <a
              href={redirect ? decodeURIComponent(redirect) : "https://instagram.com/rakkencoffee"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #833ab4, #e1306c)",
                color: "#fff",
                boxShadow: "0 4px 24px rgba(225,48,108,0.3)",
                textDecoration: "none",
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
      style={{ background: "linear-gradient(160deg, #8F0D14 0%, #A60F17 50%, #8F0D14 100%)" }}
    >
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,0,0,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "6rem",
              height: "6rem",
              borderRadius: "1rem",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <XCircle size={44} style={{ color: "rgba(255,255,255,0.5)" }} />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Belum Beruntung
            </p>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#F2F2F2" }}>
              Kali ini Belum
              <span className="block mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>Kamu Menang</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Jangan sedih! Nikmati kopi kamu dan follow Instagram kami
              untuk info event &amp; giveaway berikutnya.
            </p>
          </div>
        </div>

        <div className="glass-card-strong w-full p-6 flex flex-col items-center gap-5 text-center">
          <Coffee size={40} style={{ color: "#F2F2F2" }} />
          <div>
            <p className="font-bold text-lg" style={{ color: "#F2F2F2" }}>Follow @rakkencoffee</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Dapatkan info event, promo, &amp; giveaway kopi terbaru!
            </p>
          </div>

          <button
            id="instagram-btn"
            onClick={handleInstagramRedirect}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              padding: "1.1rem 1.5rem",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #833ab4, #e1306c)",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(225,48,108,0.3)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Instagram size={18} />
            <span>Follow Sekarang</span>
            {countdown > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.75rem",
                  opacity: 0.7,
                  fontWeight: 400,
                  background: "rgba(255,255,255,0.15)",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {countdown}s
              </span>
            )}
          </button>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
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
        style={{ background: "#B5121B" }}>
        <div className="spinner" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
