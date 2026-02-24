"use client";

import { useState, useEffect, useRef } from "react";
import { Smartphone, Sparkles, Coffee, ShieldCheck, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    const played = localStorage.getItem(STORAGE_KEY);
    if (played) setAlreadyPlayed(true);
  }, []);

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
          localStorage.setItem(STORAGE_KEY, "true");
          setAlreadyPlayed(true);
          return;
        }
        setError(data.error || "Terjadi kesalahan. Coba lagi.");
        return;
      }

      localStorage.setItem(STORAGE_KEY, "true");

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
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0d0804 0%, #1a0e06 50%, #0f0905 100%)" }}>

      {/* Background layers */}
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute inset-0 bg-radial-coffee" />

      {/* Decorative warm blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(150,80,20,0.12), transparent)" }} />
      <div className="absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(180,100,30,0.1), transparent)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, rgba(100,50,10,0.3), transparent)" }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">

        {/* Logo / Hero */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Coffee cup with steam */}
          <div className="relative">
            <div
              className="relative flex items-center justify-center w-24 h-24 rounded-2xl glow-coffee animate-float"
              style={{
                background: "linear-gradient(135deg, rgba(180,100,30,0.35), rgba(100,50,10,0.5))",
                border: "1px solid rgba(180,120,60,0.35)",
              }}
            >
              <Coffee size={44} style={{ color: "#f0c87a" }} />
            </div>
            {/* Steam wisps */}
            <div className="absolute -top-5 left-8 flex gap-2">
              {[0, 0.4, 0.8].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 h-5 rounded-full animate-steam opacity-0"
                  style={{
                    background: "rgba(240, 200, 122, 0.4)",
                    animationDelay: `${delay}s`,
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </div>
            {/* Sparkle badge */}
            <span className="absolute -top-2 -right-2 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "rgba(212, 168, 85, 0.7)" }} />
              <span className="relative inline-flex rounded-full h-5 w-5 items-center justify-center"
                style={{ background: "#c97c2e" }}>
                <Sparkles size={11} style={{ color: "#fdf4e7" }} />
              </span>
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2"
              style={{ color: "#c97c2e" }}>
              ☕ Rakken Coffee
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#fdf4e7" }}>
              Scan &{" "}
              <span className="text-glow-coffee" style={{ color: "#f0c87a" }}>
                Menangkan
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed max-w-xs" style={{ color: "#a07850" }}>
              Masukkan nomor WhatsApp kamu dan coba keberuntunganmu.
              Siapa tahu kamu pulang dengan hadiah spesial dari kami! ☕
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card-strong w-full p-6 flex flex-col gap-5">
          {alreadyPlayed ? (
            <AlreadyPlayedState />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone-input"
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "#c4956a" }}
                >
                  <Smartphone size={15} style={{ color: "#c97c2e" }} />
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
                  <p className="text-xs animate-fade-in flex items-center gap-1" style={{ color: "#e07070" }}>
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
                    <div className="spinner w-5! h-5! border-2!"
                      style={{ borderColor: "rgba(255,220,150,0.2)", borderTopColor: "#fdf4e7" }} />
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
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "#7a5c3a" }}>
          <ShieldCheck size={14} style={{ color: "rgba(100,180,100,0.7)" }} />
          <span>Data kamu aman &amp; tidak disimpan secara publik</span>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center" style={{ color: "#5a3c20" }}>
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
        style={{ background: "rgba(212,168,85,0.1)", border: "1px solid rgba(212,168,85,0.3)" }}
      >
        ⏰
      </div>
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#fdf4e7" }}>Sudah Dimainkan</h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "#a07850" }}>
          Nomor ini sudah pernah mengikuti undian.
          <br />
          Satu nomor hanya bisa bermain{" "}
          <strong style={{ color: "#fdf4e7" }}>satu kali</strong>.
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
