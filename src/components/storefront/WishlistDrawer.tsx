import { Heart, MessageCircle, X } from "lucide-react";
import type { Product } from "../../lib/types";
import { effectivePrice, firstImage } from "../../lib/productUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

type WishlistDrawerProps = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  wishlistIds: string[];
  onRemove: (id: string) => void;
  onEnquire: (product: Product) => void;
};

export function WishlistDrawer({ open, onClose, products, wishlistIds, onRemove, onEnquire }: WishlistDrawerProps) {
  useBodyScrollLock(open);
  const items = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <div className={`wishlist-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="wishlist-backdrop" onClick={onClose} />
      <aside className="wishlist-panel" role="dialog" aria-label="Your wishlist">
        <header>
          <h3>
            <Heart size={16} /> Your wishlist
          </h3>
          <button type="button" aria-label="Close wishlist" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {items.length === 0 ? (
          <p className="wishlist-empty">Nothing saved yet. Tap the heart on a piece you love.</p>
        ) : (
          <ul className="wishlist-items">
            {items.map((product) => (
              <li key={product.id}>
                <img src={firstImage(product)} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>₹{effectivePrice(product)}</span>
                </div>
                <div className="wishlist-item-actions">
                  <button type="button" onClick={() => onEnquire(product)} aria-label={`Enquire about ${product.name}`}>
                    <MessageCircle size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
