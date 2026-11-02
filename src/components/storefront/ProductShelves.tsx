import { useState } from "react";
import type { Product } from "../../lib/types";
import { isNewArrival } from "../../lib/productUtils";
import { Reveal } from "../common/Reveal";
import { ProductCard } from "./ProductCard";

type ProductShelvesProps = {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onEnquire: (product: Product) => void;
};

type Shelf = { key: string; label: string; tamil: string; items: Product[] };

const SHELF_SIZE = 10;

// New arrivals = added in the last 30 days; Bestsellers = pieces marked Featured in the admin panel.
export function ProductShelves({ products, wishlistIds, onToggleWishlist, onQuickView, onEnquire }: ProductShelvesProps) {
  const now = Date.now();
  const shelves: Shelf[] = [
    {
      key: "new",
      label: "New arrivals",
      tamil: "புதிய வரவுகள்",
      items: products
        .filter((product) => isNewArrival(product, now))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, SHELF_SIZE),
    },
    {
      key: "best",
      label: "Bestsellers",
      tamil: "அதிகம் விரும்பப்பட்டவை",
      items: products.filter((product) => product.is_featured).slice(0, SHELF_SIZE),
    },
  ].filter((shelf) => shelf.items.length > 0);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  if (shelves.length === 0) return null;
  const active = shelves.find((shelf) => shelf.key === activeKey) ?? shelves[0];

  return (
    <section className="shelves-section" aria-label="New arrivals and bestsellers">
      <Reveal className="shelves-head">
        <p className="eyebrow" lang="ta">{active.tamil}</p>
        <div className="shelves-tabs" role="tablist" aria-label="Collections">
          {shelves.map((shelf) => (
            <button
              key={shelf.key}
              type="button"
              role="tab"
              id={`shelf-tab-${shelf.key}`}
              aria-selected={shelf.key === active.key}
              aria-controls="shelf-panel"
              className={shelf.key === active.key ? "is-active" : ""}
              onClick={() => setActiveKey(shelf.key)}
            >
              {shelf.label}
              <span>{shelf.items.length}</span>
            </button>
          ))}
        </div>
      </Reveal>
      <div
        className="shelf-row"
        id="shelf-panel"
        role="tabpanel"
        aria-labelledby={`shelf-tab-${active.key}`}
        key={active.key}
      >
        {active.items.map((product) => (
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
    </section>
  );
}
