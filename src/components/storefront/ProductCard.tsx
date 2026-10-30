import { Heart, MessageCircle, Search } from "lucide-react";
import type { Product } from "../../lib/types";
import { effectivePrice, firstImage, hasOffer, stockStatus } from "../../lib/productUtils";

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

  return (
    <article className="product-card">
      <div className="product-image">
        {product.label && <span className="product-label">{product.label}</span>}
        {offer && <span className="product-offer">Offer</span>}
        <button
          type="button"
          className={`wishlist-dot ${isWishlisted ? "is-active" : ""}`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          onClick={() => onToggleWishlist(product.id)}
        >
          <Heart size={14} />
        </button>
        <img src={firstImage(product)} alt={`${product.name} jewellery`} loading="lazy" />
        <div className="product-image-actions">
          <button type="button" onClick={() => onQuickView(product)}>
            <Search size={14} /> Quick view
          </button>
          <button type="button" onClick={() => onEnquire(product)}>
            <MessageCircle size={14} /> Enquire
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
