import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, X } from "lucide-react";
import type { Product } from "../../lib/types";
import {
  effectivePrice,
  firstImage,
  hasOffer,
  isCutoutImage,
  offerCountdownLabel,
  pastelBackground,
  productShareUrl,
  stockStatus,
} from "../../lib/productUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { ImagePager } from "../common/ImagePager";

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
  onEnquire: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
};

export function ProductQuickView({ product, onClose, onEnquire, isWishlisted, onToggleWishlist }: ProductQuickViewProps) {
  useBodyScrollLock(Boolean(product));
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareNote, setShareNote] = useState<string | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setShareNote(null);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;
  const stock = stockStatus(product.stock);
  const offer = hasOffer(product);
  const countdown = offer ? offerCountdownLabel(product.offer_ends_at) : null;
  const gallery = product.images.length > 0 ? product.images : [firstImage(product)];

  async function share(current: Product) {
    const url = productShareUrl(current);
    const data = { title: `${current.name} · POIGAI`, text: `Have a look at ${current.name} from POIGAI`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareNote(url);
    }
  }

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-label={`${product.name} quick view`}>
      <div className="quick-view-backdrop" onClick={onClose} />
      <div className="quick-view-panel">
        <button type="button" className="quick-view-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="quick-view-image" style={{ background: pastelBackground(product.id) }}>
          <ImagePager
            images={gallery}
            alt={`${product.name} jewellery`}
            index={activeIndex}
            onIndexChange={setActiveIndex}
            showDots={false}
            eager
          />
          {gallery.length > 1 && (
            <div className="quick-view-thumbs">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  key={image + index}
                  className={index === activeIndex ? "is-active" : ""}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={image} alt="" className={isCutoutImage(image) ? "is-cutout" : ""} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="quick-view-details">
          <div className="quick-view-badges">
            {product.label && <span className="badge badge-label">{product.label}</span>}
            {product.is_combo && <span className="badge badge-combo">Combo</span>}
            {offer && <span className="badge badge-offer">{countdown ?? "Offer"}</span>}
          </div>
          <p className="eyebrow">{product.category_name ?? "POIGAI"}</p>
          <h3>{product.name}</h3>
          <div className="quick-view-price">
            {offer ? (
              <>
                <strong>₹{effectivePrice(product)}</strong>
                <s>₹{product.price}</s>
              </>
            ) : (
              <strong>₹{product.price}</strong>
            )}
          </div>
          <span className={`stock-pill stock-${stock.tone}`}>{stock.text}</span>
          {product.description && <p className="quick-view-description">{product.description}</p>}
          {product.is_combo && product.combo_includes && (
            <p className="quick-view-combo">
              <strong>Includes:</strong> {product.combo_includes}
            </p>
          )}
          <div className="quick-view-actions">
            <button type="button" className="primary-link" onClick={() => onEnquire(product)}>
              <MessageCircle size={16} /> Enquire on WhatsApp
            </button>
            <button
              type="button"
              className={`wishlist-toggle ${isWishlisted ? "is-active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
              aria-pressed={isWishlisted}
            >
              <Heart size={16} /> {isWishlisted ? "Saved" : "Save"}
            </button>
            <button type="button" className="wishlist-toggle" onClick={() => share(product)}>
              <Share2 size={16} /> Share
            </button>
          </div>
          {shareNote && (
            <p className="quick-view-share-note" aria-live="polite">
              {shareNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
