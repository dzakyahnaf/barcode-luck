import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Lucky Draw — Scan & Win!",
  description:
    "Scan QR Code dan menangkan hadiah menarik secara instan. Sistem undian digital real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
