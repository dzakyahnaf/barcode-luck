"use client";

import { useState, useRef } from "react";
import { Smartphone, ChevronRight, Instagram } from "lucide-react";
import Image from "next/image";

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
    <main
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #7a0e15 0%, #A8131E 40%, #B5161F 70%, #c41d28 100%)",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 bg-dots opacity-30" />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)",
      }} />

      {/* Decorative light blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,30,40,0.35), transparent)" }} />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,19,30,0.3), transparent)" }} />

      {/* Content */}
      <div
        className="relative z-10 w-full flex flex-col items-center animate-fade-in-up"
        style={{ maxWidth: "400px" }}
      >

        {/* ===== LOGO ===== */}
        <div style={{ marginBottom: "1.75rem" }}>
          <Image
            src="/images/logo-rakken.png"
            alt="Rakken Coffee"
            width={340}
            height={340}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* ===== TAGLINE ===== */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{
            color: "#F2F2F2",
            fontSize: "1.1rem",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "0.25rem",
          }}>
            Your New Everyday Ritual
          </p>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.95rem",
            fontWeight: 400,
          }}>
            For Everyday Sips and Bites.
          </p>
        </div>

        {/* ===== HEADLINE ===== */}
        <h1 style={{
          color: "#FFFFFF",
          fontSize: "1.75rem",
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.2,
          marginBottom: "1.5rem",
          textShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}>
          Follow &amp; Menangkan<br />
          <span style={{ color: "#fde68a", textShadow: "0 0 20px rgba(252,211,77,0.4)" }}>
            Hadiah Emas!
          </span>
        </h1>

        {/* ===== RULES ===== */}
        <div style={{
          background: "rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "0.875rem",
          padding: "1.25rem 1.5rem",
          width: "100%",
          marginBottom: "1.5rem",
        }}>
          <p style={{ color: "#F2F2F2", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
            Rules:
          </p>
          <ol style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            paddingLeft: "1.25rem",
            listStyleType: "decimal",
            margin: 0,
          }}>
            <li>Follow <strong style={{ color: "#F2F2F2" }}>@rakkencoffee</strong> and win gold.</li>
            <li>Enter your phone number below to participate.</li>
          </ol>
        </div>

        {/* ===== FORM CARD ===== */}
        <div
          className="glass-card-strong flex flex-col"
          style={{
            width: "100%",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            gap: "1.25rem",
          }}
        >
          {alreadyPlayed ? (
            <AlreadyPlayedState />
          ) : (
            <>
              {/* Phone input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  htmlFor="phone-input"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Smartphone size={15} style={{ color: "#F2F2F2" }} />
                  Phone Number
                </label>
                <input
                  ref={inputRef}
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="Enter your phone number"
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
                  <p style={{ color: "#fca5a5", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                id="spin-btn"
                onClick={handleSpin}
                disabled={isLoading || !phone.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: "100%",
                  padding: "1rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: isLoading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)",
                  color: "#F2F2F2",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: (!phone.trim() || isLoading) ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ width: "1.25rem", height: "1.25rem", borderWidth: "2px" }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Join Now</span>
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
                  padding: "1rem 1.5rem",
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

        {/* ===== WINNER ANNOUNCEMENT ===== */}
        <p style={{
          color: "#fde68a",
          fontSize: "0.85rem",
          fontWeight: 600,
          textAlign: "center",
          marginBottom: "0.75rem",
          textShadow: "0 0 15px rgba(252,211,77,0.3)",
        }}>
          🏆 The winner will be announced on Instagram 1 April 2026
        </p>

        {/* ===== BE PART OF IT ===== */}
        <p style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.8rem",
          fontWeight: 500,
          textAlign: "center",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Be part of it
        </p>

      </div>
    </main>
  );
}

function AlreadyPlayedState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 0",
      textAlign: "center",
    }}>
      <div style={{
        width: "4rem",
        height: "4rem",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.875rem",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        ⏰
      </div>
      <div>
        <h2 style={{ color: "#F2F2F2", fontSize: "1.125rem", fontWeight: 700 }}>
          Already Participated
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginTop: "0.25rem", lineHeight: 1.5 }}>
          This number has already entered the draw.<br />
          One number, <strong style={{ color: "#F2F2F2" }}>one chance</strong>.
        </p>
      </div>
      <a
        href="https://instagram.com/rakkencoffee"
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
        <Instagram size={16} />
        <span>Follow @rakkencoffee</span>
      </a>
    </div>
  );
}
