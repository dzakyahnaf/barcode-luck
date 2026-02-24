"use client";

import { useState, useEffect, useRef } from "react";
import { Smartphone, Sparkles, Gift, ShieldCheck, ChevronRight } from "lucide-react";

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

      // Mark as played in localStorage
      localStorage.setItem(STORAGE_KEY, "true");

      if (data.won && data.code) {
        // Redirect to win page
        window.location.href = `/result?won=true&code=${data.code}`;
      } else {
        // Redirect to lose page first, then Instagram
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
    <main className="relative min-h-screen overflow-hidden bg-[#080a0f] flex flex-col items-center justify-center px-4 py-10">
      {/* Background layers */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-0 bg-radial-purple" />
      <div className="absolute top-0 -left-32 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-0 -right-32 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">

        {/* Hero icon + tagline */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl glow-purple animate-float"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.4))",
              border: "1px solid rgba(139,92,246,0.4)",
            }}
          >
            <Gift size={44} className="text-purple-300" />
            <span className="absolute -top-2 -right-2 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 items-center justify-center">
                <Sparkles size={11} className="text-white" />
              </span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Scan &amp; <span className="text-purple-400 text-glow-purple">Menangkan</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xs">
              Masukkan nomor WhatsApp kamu dan coba keberuntunganmu sekarang.
              Siapa tahu kamu yang jadi pemenang hari ini! 🎁
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
                  className="text-sm font-medium text-slate-300 flex items-center gap-2"
                >
                  <Smartphone size={15} className="text-purple-400" />
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
                  <p className="text-red-400 text-xs animate-fade-in flex items-center gap-1">
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
                    <div className="spinner !w-5 !h-5 !border-2 !border-white/20 !border-t-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Coba Keberuntunganmu!</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <ShieldCheck size={14} className="text-green-500/70" />
          <span>Data kamu aman &amp; tidak disimpan secara publik</span>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs text-center">
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
        style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        ⏰
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Sudah Dimainkan</h2>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
          Nomor ini sudah pernah mengikuti undian.
          <br />
          Satu nomor hanya bisa bermain <strong className="text-white">satu kali</strong>.
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
