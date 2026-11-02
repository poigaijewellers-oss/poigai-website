import type { Product } from "../../lib/types";
import { effectivePrice, firstImage, isCutoutImage, pastelBackground } from "../../lib/productUtils";

type RecentlyViewedProps = {
  products: Product[];
  onOpen: (product: Product) => void;
};

export function RecentlyViewed({ products, onOpen }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <div className="recently-viewed">
      <div className="recently-viewed-head">
        <p className="eyebrow">Recently viewed</p>
        <span>Pick up where you left off</span>
      </div>
      <div className="recently-viewed-row">
        {products.map((product) => {
          const image = firstImage(product);
          return (
            <button type="button" key={product.id} className="recent-item" onClick={() => onOpen(product)}>
              <span className="recent-thumb" style={{ background: pastelBackground(product.id) }}>
                <img src={image} alt="" className={isCutoutImage(image) ? "is-cutout" : ""} loading="lazy" />
              </span>
              <span className="recent-name">{product.name}</span>
              <span className="recent-price">₹{effectivePrice(product)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
