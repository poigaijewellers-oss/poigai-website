import type { Product } from "../../lib/types";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onEnquire: (product: Product) => void;
  loading: boolean;
};

export function ProductGrid({
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onEnquire,
  loading,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="Loading the collection">
        {[0, 1, 2].map((key) => (
          <div className="product-card product-skeleton" key={key} aria-hidden="true">
            <div className="skeleton-block skeleton-image" />
            <div className="skeleton-lines">
              <span className="skeleton-block" />
              <span className="skeleton-block short" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return <div className="product-grid-empty">No pieces match your search yet. Try a different filter.</div>;
  }
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.includes(product.id)}
          onToggleWishlist={onToggleWishlist}
          onQuickView={onQuickView}
          onEnquire={onEnquire}
        />
      ))}
    </div>
  );
}
