import { Heart, MessageCircle, X } from "lucide-react";
import type { Product } from "../../lib/types";
import { effectivePrice, firstImage, hasOffer, stockStatus } from "../../lib/productUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
  onEnquire: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
};

export function ProductQuickView({ product, onClose, onEnquire, isWishlisted, onToggleWishlist }: ProductQuickViewProps) {
  useBodyScrollLock(Boolean(product));

  if (!product) return null;
  const stock = stockStatus(product.stock);
  const offer = hasOffer(product);

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-label={`${product.name} quick view`}>
      <div className="quick-view-backdrop" onClick={onClose} />
      <div className="quick-view-panel">
        <button type="button" className="quick-view-close" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="quick-view-image">
          <img src={firstImage(product)} alt={`${product.name} jewellery`} />
        </div>
        <div className="quick-view-details">
          {product.label && <span className="product-label">{product.label}</span>}
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
          </div>
        </div>
      </div>
    </div>
  );
}
