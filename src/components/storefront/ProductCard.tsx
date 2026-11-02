import { Heart, MessageCircle, Search } from "lucide-react";
import type { Product } from "../../lib/types";
import {
  effectivePrice,
  firstImage,
  hasOffer,
  isNewArrival,
  offerCountdownLabel,
  pastelBackground,
  stockStatus,
} from "../../lib/productUtils";
import { ImagePager } from "../common/ImagePager";

type ProductCardProps = {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onEnquire: (product: Product) => void;
};

export function ProductCard({ product, isWishlisted, onToggleWishlist, onQuickView, onEnquire }: ProductCardProps) {
  const stock = stockStatus(product.stock);
  const offer = hasOffer(product);
  const countdown = offer ? offerCountdownLabel(product.offer_ends_at) : null;
  const wishlistLabel = isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`;
  const gallery = product.images.length > 0 ? product.images : [firstImage(product)];

  return (
    <article className="product-card">
      <div className="product-media">
        <div className="product-image" style={{ background: pastelBackground(product.id) }}>
          <div className="product-badges">
            {product.label && <span className="badge badge-label">{product.label}</span>}
            {!product.label && isNewArrival(product) && <span className="badge badge-new">New</span>}
            {product.is_combo && <span className="badge badge-combo">Combo</span>}
            {offer && <span className="badge badge-offer">{countdown ?? "Offer"}</span>}
          </div>
          <button
            type="button"
            className={`wishlist-dot ${isWishlisted ? "is-active" : ""}`}
            aria-label={wishlistLabel}
            aria-pressed={isWishlisted}
            onClick={() => onToggleWishlist(product.id)}
          >
            <Heart size={14} />
          </button>
          <ImagePager images={gallery} alt={`${product.name} jewellery`} onImageClick={() => onQuickView(product)} />
        </div>
        <div className="product-actions">
          <button type="button" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}>
            <Search size={14} /> <span>Quick view</span>
          </button>
          <button type="button" onClick={() => onEnquire(product)} aria-label={`Enquire about ${product.name}`}>
            <MessageCircle size={14} /> <span>Enquire</span>
          </button>
          <button
            type="button"
            className={`product-actions-wish ${isWishlisted ? "is-active" : ""}`}
            aria-label={wishlistLabel}
            aria-pressed={isWishlisted}
            onClick={() => onToggleWishlist(product.id)}
          >
            <Heart size={14} />
          </button>
        </div>
      </div>
      <div className="product-details">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category_name ?? "POIGAI"}</p>
          <span className={`stock-pill stock-${stock.tone}`}>{stock.text}</span>
        </div>
        <div className="product-price">
          {offer && <s>₹{product.price}</s>}
          <strong>₹{effectivePrice(product)}</strong>
        </div>
      </div>
    </article>
  );
}
