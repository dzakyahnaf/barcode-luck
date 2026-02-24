/**
 * Generates a cryptographically strong unique code
 * 8 uppercase alphanumeric characters (A-Z, 0-9)
 * 36^8 = ~2.8 trillion combinations
 */
export function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // removed confusable chars (0,O,1,I)
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

/**
 * Hash a phone number using SHA-256 for privacy-preserving deduplication
 */
export async function hashIdentifier(phone: string): Promise<string> {
  const normalized = phone.replace(/\s+/g, "").replace(/^(\+62|62)/, "0");
  const encoder = new TextEncoder();
  const data = encoder.encode(`qr-campaign:${normalized}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Run the RNG engine
 * Returns true if user wins based on configured win rate
 */
export function runRNG(winRatePercent: number): boolean {
  return Math.random() * 100 < winRatePercent;
}
