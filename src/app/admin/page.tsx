"use client";

import { useState, useEffect } from "react";
import { BarChart3, Ticket, CheckCircle2, Users, RefreshCw, LogIn, Eye, EyeOff, ShieldCheck } from "lucide-react";

const ADMIN_KEY = "qr_admin_token";

interface Stats {
  totalScans: number;
  totalWins: number;
  totalClaimed: number;
  winRateActual: number;
}

interface WinnerCode {
  code: string;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  scan_entries?: { ip_address: string } | null;
}

interface CodesResponse {
  codes: WinnerCode[];
  total: number;
  page: number;
  pageSize: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
        <Icon size={20} className={colorClass} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <p className={`text-2xl font-extrabold mt-0.5 ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [codesData, setCodesData] = useState<CodesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [page, setPage] = useState(1);
  const [markingCode, setMarkingCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY);
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAll();
    }
  }, [authenticated, page]); // eslint-disable-line

  const handleLogin = () => {
    if (!inputToken.trim()) return;
    sessionStorage.setItem(ADMIN_KEY, inputToken.trim());
    setToken(inputToken.trim());
    setAuthenticated(true);
  };

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    setStatsError("");
    try {
      const [statsRes, codesRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch(`/api/admin/codes?page=${page}`, { headers }),
      ]);

      if (statsRes.status === 401) {
        sessionStorage.removeItem(ADMIN_KEY);
        setAuthenticated(false);
        setStatsError("Token tidak valid.");
        setLoading(false);
        return;
      }

      const statsJson = await statsRes.json();
      const codesJson = await codesRes.json();

      setStats(statsJson);
      setCodesData(codesJson);
    } catch {
      setStatsError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const markClaimed = async (code: string) => {
    setMarkingCode(code);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        await fetchAll();
      }
    } finally {
      setMarkingCode(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // === LOGIN SCREEN ===
  if (!authenticated) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #0d0804 0%, #1a0e06 50%, #0f0905 100%)" }}>
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="absolute inset-0 bg-radial-purple" />
        <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
          <div className="glass-card-strong p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(180,100,30,0.15)", border: "1px solid rgba(180,100,30,0.3)" }}
              >
                <ShieldCheck size={28} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Masukkan secret token untuk masuk</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  id="admin-token-input"
                  type={showToken ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="Admin secret token..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {statsError && (
                <p className="text-red-400 text-xs text-center">{statsError}</p>
              )}
              <button
                id="admin-login-btn"
                onClick={handleLogin}
                disabled={!inputToken.trim()}
                className="btn-primary w-full"
              >
                <LogIn size={17} />
                <span>Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // === DASHBOARD ===
  const totalPages = codesData ? Math.ceil(codesData.total / codesData.pageSize) : 1;

  return (
    <main className="relative min-h-screen px-4 py-8"
      style={{ background: "linear-gradient(160deg, #0d0804 0%, #1a0e06 50%, #0f0905 100%)" }}>
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute inset-0 bg-radial-coffee opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="text-amber-400" size={24} />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">QR Code Instant Reward Campaign</p>
          </div>
          <button
            id="refresh-btn"
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Scan"
              value={stats.totalScans.toLocaleString()}
              colorClass="text-blue-400"
              bgClass="bg-blue-500/10"
            />
            <StatCard
              icon={Ticket}
              label="Total Menang"
              value={stats.totalWins.toLocaleString()}
              colorClass="text-amber-400"
              bgClass="bg-amber-500/10"
            />
            <StatCard
              icon={CheckCircle2}
              label="Total Diklaim"
              value={stats.totalClaimed.toLocaleString()}
              colorClass="text-emerald-400"
              bgClass="bg-emerald-500/10"
            />
            <StatCard
              icon={BarChart3}
              label="Win Rate Aktual"
              value={`${stats.winRateActual}%`}
              colorClass="text-amber-400"
              bgClass="bg-amber-500/10"
            />
          </div>
        )}

        {/* Codes Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Ticket size={17} className="text-amber-400" />
              Kode Pemenang
              {codesData && (
                <span
                  className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  {codesData.total} total
                </span>
              )}
            </h2>
            <span className="text-slate-500 text-sm">
              Halaman {page} / {totalPages}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading && !codesData ? (
              <div className="flex items-center justify-center py-16">
                <div className="spinner" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Kode</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Waktu Menang</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Waktu Klaim</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {codesData?.codes.map((c) => (
                    <tr key={c.code} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <span
                          className="font-mono font-bold text-base text-amber-300 tracking-widest"
                        >
                          {c.code}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {c.claimed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle2 size={11} /> Diklaim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⏳ Belum Diklaim
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-400 hidden md:table-cell text-xs">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-5 py-3 text-slate-400 hidden md:table-cell text-xs">
                        {formatDate(c.claimed_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!c.claimed && (
                          <button
                            onClick={() => markClaimed(c.code)}
                            disabled={markingCode === c.code}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                            style={{
                              background: "rgba(16,185,129,0.12)",
                              border: "1px solid rgba(16,185,129,0.3)",
                              color: "#10b981",
                            }}
                          >
                            {markingCode === c.code ? "..." : "Tandai Klaim"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {codesData?.codes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        Belum ada pemenang
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {codesData && totalPages > 1 && (
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm px-4 py-2 rounded-lg text-slate-300 disabled:opacity-30 transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                ← Sebelumnya
              </button>
              <span className="text-slate-400 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-sm px-4 py-2 rounded-lg text-slate-300 disabled:opacity-30 transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Berikutnya →
              </button>
            </div>
          )}
        </div>

        {/* Validate Code Section */}
        <ValidateCodeSection token={token} />
      </div>
    </main>
  );
}

function ValidateCodeSection({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | { valid: boolean; claimed?: boolean; createdAt?: string; message?: string }>(null);
  const [checking, setChecking] = useState(false);

  const checkCode = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`/api/validate-code?code=${code.trim().toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <ShieldCheck size={17} className="text-amber-400" />
        Validasi Kode
      </h2>
      <div className="flex gap-2">
        <input
          id="validate-code-input"
          type="text"
          className="input-field font-mono uppercase tracking-widest flex-1"
          placeholder="Masukkan 8 karakter kode pemenang..."
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && checkCode()}
          maxLength={8}
        />
        <button
          id="check-code-btn"
          onClick={checkCode}
          disabled={checking || code.length !== 8}
          className="btn-primary px-5 py-2 text-sm whitespace-nowrap"
        >
          {checking ? <div className="spinner w-4! h-4! border-2!" /> : "Cek Kode"}
        </button>
      </div>
      {result && (
        <div
          className="p-4 rounded-xl text-sm animate-fade-in"
          style={{
            background: result.valid
              ? result.claimed
                ? "rgba(16,185,129,0.08)"
                : "rgba(245,158,11,0.08)"
              : "rgba(239,68,68,0.08)",
            border: result.valid
              ? result.claimed
                ? "1px solid rgba(16,185,129,0.25)"
                : "1px solid rgba(245,158,11,0.25)"
              : "1px solid rgba(239,68,68,0.25)",
          }}
        >
          {!result.valid && (
            <p className="text-red-400 font-semibold">❌ Kode tidak valid / tidak ditemukan</p>
          )}
          {result.valid && result.claimed && (
            <p className="text-green-400 font-semibold">✅ Kode valid — Sudah diklaim</p>
          )}
          {result.valid && !result.claimed && (
            <p className="text-amber-400 font-semibold">🎟️ Kode valid — Belum diklaim</p>
          )}
        </div>
      )}
    </div>
  );
}
