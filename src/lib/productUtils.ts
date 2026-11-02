import type { Product } from "./types";

export const PLACEHOLDER_IMAGE = "/poigai-logo-mark-256.png";

export function firstImage(product: Product): string {
  return product.images[0] ?? PLACEHOLDER_IMAGE;
}

// Product photos with the background removed are stored as "cutout-<id>.webp".
export function isCutoutImage(url: string): boolean {
  return /\/cutout-[^/]+$/.test(url);
}

const PASTELS: [string, string][] = [
  ["#fbe7e6", "#f3d0d2"],
  ["#fdeedd", "#f5d8bc"],
  ["#f8f0dc", "#ecdcb6"],
  ["#f0e8f6", "#ddd0ec"],
  ["#e8f2ea", "#d0e5d7"],
  ["#e8f0f7", "#d2e1ee"],
];

// Each product gets its own soft pastel backdrop, stable across visits.
export function pastelBackground(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const [from, to] = PASTELS[hash % PASTELS.length];
  return `linear-gradient(160deg, ${from} 0%, ${to} 100%)`;
}

export function effectivePrice(product: Product): number {
  return hasOffer(product) ? (product.offer_price as number) : product.price;
}

export function hasOffer(product: Product): boolean {
  if (product.offer_price == null || product.offer_price >= product.price) return false;
  if (product.offer_ends_at && new Date(product.offer_ends_at).getTime() <= Date.now()) return false;
  return true;
}

export function offerCountdownLabel(offerEndsAt: string | null): string | null {
  if (!offerEndsAt) return null;
  const diffMs = new Date(offerEndsAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `Ends in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `Ends in ${hours}h ${minutes}m`;
  return `Ends in ${minutes}m`;
}

export function stockStatus(stock: number): { text: string; tone: "out" | "low" | "in" } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= 3) return { text: `Only ${stock} left`, tone: "low" };
  return { text: "In stock", tone: "in" };
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildEnquiryMessage(product?: Product): string {
  if (!product) {
    return "Vanakkam POIGAI! I'd love to explore your collection.";
  }
  const price = effectivePrice(product);
  const stock = stockStatus(product.stock);
  const comboNote = product.is_combo ? " (combo set)" : "";
  const stockNote =
    stock.tone === "out"
      ? " I see it's currently out of stock — please let me know when it's back."
      : "";
  return `Vanakkam POIGAI! I'm interested in ${product.name}${comboNote} (₹${price}).${stockNote} Please share the availability and details.`;
}

export function enquireAboutWishlist(whatsappNumber: string, products: Product[]) {
  const lines = products.map((product, index) => `${index + 1}. ${product.name} (₹${effectivePrice(product)})`);
  const message = `Vanakkam POIGAI! I'd like to know more about these pieces from my wishlist:\n${lines.join("\n")}\nPlease share availability and details.`;
  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

// A link that opens the shop with this piece's quick view already showing.
export function productShareUrl(product: Product): string {
  return `${window.location.origin}/?p=${encodeURIComponent(product.id)}`;
}

export function enquireOnWhatsApp(whatsappNumber: string, product?: Product) {
  const message = buildEnquiryMessage(product);
  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
}
