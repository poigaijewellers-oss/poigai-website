import { Heart, MessageCircle, X } from "lucide-react";
import type { Product } from "../../lib/types";
import { effectivePrice, firstImage, isCutoutImage, pastelBackground } from "../../lib/productUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

type WishlistDrawerProps = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  wishlistIds: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onEnquire: (product: Product) => void;
  onEnquireAll: (products: Product[]) => void;
  onOpenProduct: (product: Product) => void;
};

export function WishlistDrawer({
  open,
  onClose,
  products,
  wishlistIds,
  onRemove,
  onClear,
  onEnquire,
  onEnquireAll,
  onOpenProduct,
}: WishlistDrawerProps) {
  useBodyScrollLock(open);
  const items = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <div className={`wishlist-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="wishlist-backdrop" onClick={onClose} />
      <aside className="wishlist-panel" role="dialog" aria-label="Your wishlist">
        <header>
          <h3>
            <Heart size={16} /> Your wishlist {items.length > 0 && <small>({items.length})</small>}
          </h3>
          <button type="button" aria-label="Close wishlist" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {items.length === 0 ? (
          <p className="wishlist-empty">Nothing saved yet. Tap the heart on a piece you love.</p>
        ) : (
          <ul className="wishlist-items">
            {items.map((product) => {
              const image = firstImage(product);
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    className="wishlist-item-open"
                    onClick={() => onOpenProduct(product)}
                    aria-label={`View ${product.name}`}
                  >
                    <span className="wishlist-thumb" style={{ background: pastelBackground(product.id) }}>
                      <img src={image} alt="" className={isCutoutImage(image) ? "is-cutout" : ""} />
                    </span>
                    <span className="wishlist-item-text">
                      <strong>{product.name}</strong>
                      <span>₹{effectivePrice(product)}</span>
                    </span>
                  </button>
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
              );
            })}
          </ul>
        )}
        <footer className="wishlist-footer">
          {items.length > 0 && (
            <>
              <button type="button" className="primary-link wishlist-send" onClick={() => onEnquireAll(items)}>
                <MessageCircle size={16} /> Ask about all {items.length} on WhatsApp
              </button>
              <button type="button" className="wishlist-clear" onClick={onClear}>
                Clear wishlist
              </button>
            </>
          )}
          <p className="wishlist-note">Saved on this device, so it's still here next time you visit.</p>
        </footer>
      </aside>
    </div>
  );
}
