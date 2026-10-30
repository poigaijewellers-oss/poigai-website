import type { Product } from "./types";

export const PLACEHOLDER_IMAGE = "/poigai-logo.png";

export function firstImage(product: Product): string {
  return product.images[0] ?? PLACEHOLDER_IMAGE;
}

export function effectivePrice(product: Product): number {
  return product.offer_price ?? product.price;
}

export function hasOffer(product: Product): boolean {
  return product.offer_price != null && product.offer_price < product.price;
}

export function stockStatus(stock: number): { text: string; tone: "out" | "low" | "in" } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= 3) return { text: `Only ${stock} left`, tone: "low" };
  return { text: "In stock", tone: "in" };
}

export function buildEnquiryMessage(product?: Product): string {
  if (!product) {
    return "Vanakkam POIGAI! I'd love to explore your collection.";
  }
  const price = effectivePrice(product);
  const stock = stockStatus(product.stock);
  const stockNote =
    stock.tone === "out"
      ? " I see it's currently out of stock — please let me know when it's back."
      : "";
  return `Vanakkam POIGAI! I'm interested in ${product.name} (₹${price}).${stockNote} Please share the availability and details.`;
}

export function enquireOnWhatsApp(whatsappNumber: string, product?: Product) {
  const message = buildEnquiryMessage(product);
  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
}
