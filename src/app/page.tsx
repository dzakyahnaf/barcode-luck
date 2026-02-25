"use client";

import { useState, useEffect, useRef } from "react";
import { Smartphone, Sparkles, Coffee, ShieldCheck, ChevronRight, Instagram } from "lucide-react";

const STORAGE_KEY = "qr_campaign_played";

interface SpinResult {
  won: boolean;
  code?: string;
  redirectUrl?: string;
  error?: string;
  alreadyPlayed?: boolean;
}

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  const validatePhone = (p: string) => {
    const cleaned = p.replace(/\D/g, "");
    return cleaned.length >= 9 && cleaned.length <= 15;
  };

  const handleSpin = async () => {
    setError("");
    if (!validatePhone(phone)) {
      setError("Masukkan nomor WhatsApp yang valid (min. 9 digit).");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data: SpinResult = await res.json();

      if (!res.ok) {
        if (data.alreadyPlayed) {
          setAlreadyPlayed(true);
          return;
        }
        setError(data.error || "Terjadi kesalahan. Coba lagi.");
        return;
      }


      if (data.won && data.code) {
        window.location.href = `/result?won=true&code=${data.code}`;
      } else {
        window.location.href = `/result?won=false&redirect=${encodeURIComponent(data.redirectUrl || "https://instagram.com/rakkencoffee")}`;
      }
    } catch {
      setError("Koneksi gagal. Periksa internet dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSpin();
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #6b0a10 0%, #8F0D14 35%, #B5121B 60%, #cc1a24 100%)", padding: "3.5rem 1.5rem" }}>

      {/* Background layers */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-0 bg-radial-red" />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-60"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3), transparent)" }} />
      <div className="absolute bottom-0 left-0 w-full h-60"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.2), transparent)" }} />
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(204,26,36,0.4), transparent)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(181,18,27,0.35), transparent)" }} />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-10 animate-fade-in-up"
        style={{ maxWidth: "420px", padding: "0 0.5rem" }}>

        {/* Logo / Hero */}
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Coffee cup with steam */}
          <div className="relative">
            <div
              className="relative flex items-center justify-center w-24 h-24 rounded-2xl animate-float"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 40px rgba(0,0,0,0.2)",
              }}
            >
              <Coffee size={44} style={{ color: "#F2F2F2" }} />
            </div>
            {/* Steam wisps */}
            <div className="absolute -top-5 left-8 flex gap-2">
              {[0, 0.4, 0.8].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 h-5 rounded-full animate-steam opacity-0"
                  style={{
                    background: "rgba(255, 255, 255, 0.35)",
                    animationDelay: `${delay}s`,
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </div>
            {/* Sparkle badge */}
            <span className="absolute -top-2 -right-2 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "rgba(252, 211, 77, 0.7)" }} />
              <span className="relative inline-flex rounded-full h-5 w-5 items-center justify-center"
                style={{ background: "#fcd34d" }}>
                <Sparkles size={11} style={{ color: "#8F0D14" }} />
              </span>
            </span>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.6)" }}>
              ☕ Rakken Coffee
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#F2F2F2" }}>
              Welcome To<br />
              <span style={{ color: "#fde68a", textShadow: "0 0 30px rgba(252,211,77,0.4)", whiteSpace: "nowrap" }}>
                Rakken Coffee
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              Masukkan nomor WhatsApp kamu dan coba keberuntunganmu.
              Siapa tahu kamu pulang dengan hadiah spesial dari kami! ☕
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card-strong flex flex-col gap-6"
          style={{ width: "calc(100% - 1rem)", padding: "1.75rem", margin: "0 auto" }}>
          {alreadyPlayed ? (
            <AlreadyPlayedState />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone-input"
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <Smartphone size={15} style={{ color: "#F2F2F2" }} />
                  Nomor WhatsApp
                </label>
                <input
                  ref={inputRef}
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  maxLength={16}
                  autoComplete="tel"
                  autoFocus
                />
                {error && (
                  <p className="text-xs animate-fade-in flex items-center gap-1" style={{ color: "#fca5a5" }}>
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              <button
                id="spin-btn"
                className="btn-primary w-full text-base"
                onClick={handleSpin}
                disabled={isLoading || !phone.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-5! h-5! border-2!" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Coffee size={18} />
                    <span>Coba Keberuntunganmu!</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              {/* Instagram CTA */}
              <a
                href="https://instagram.com/rakkencoffee"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  width: "100%",
                  padding: "1.1rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #833ab4, #e1306c, #f56040)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(225,48,108,0.3)",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                <Instagram size={20} />
                <span>Follow @rakkencoffee</span>
              </a>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          <ShieldCheck size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          <span>Data kamu aman &amp; tidak disimpan secara publik</span>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          Scan QR Code di banner untuk berpartisipasi. Satu nomor, satu kesempatan.
        </p>
      </div>
    </main>
  );
}

function AlreadyPlayedState() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        ⏰
      </div>
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#F2F2F2" }}>Sudah Dimainkan</h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Nomor ini sudah pernah mengikuti undian.
          <br />
          Satu nomor hanya bisa bermain{" "}
          <strong style={{ color: "#F2F2F2" }}>satu kali</strong>.
        </p>
      </div>
      <a
        href="https://instagram.com/rakkencoffee"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-sm px-6 py-3"
        style={{
          background: "linear-gradient(135deg, #833ab4, #e1306c)",
          boxShadow: "0 4px 24px rgba(225,48,108,0.3)",
        }}
      >
        <span>Follow Instagram Kami</span>
      </a>
    </div>
  );
}
