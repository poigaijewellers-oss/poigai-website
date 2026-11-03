import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, X, ZoomIn } from "lucide-react";
import type { Product } from "../../lib/types";
import {
  effectivePrice,
  firstImage,
  hasOffer,
  isCutoutImage,
  offerCountdownLabel,
  pastelBackground,
  productShareUrl,
  relatedProducts,
  stockStatus,
} from "../../lib/productUtils";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { ImagePager } from "../common/ImagePager";
import { ImageZoomViewer } from "../common/ImageZoomViewer";

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
  onEnquire: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  products: Product[];
  onOpenProduct: (product: Product) => void;
};

export function ProductQuickView({
  product,
  onClose,
  onEnquire,
  isWishlisted,
  onToggleWishlist,
  products,
  onOpenProduct,
}: ProductQuickViewProps) {
  useBodyScrollLock(Boolean(product));
  const [activeIndex, setActiveIndex] = useState(0);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [descriptionLong, setDescriptionLong] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
    setShareNote(null);
    setZoomOpen(false);
    setDescriptionOpen(false);
    scrollRef.current?.scrollTo({ top: 0 }); // opening a suggested piece starts at its photo
  }, [product?.id]);

  // Only offer "Read more" when the description really runs past two lines.
  useLayoutEffect(() => {
    const node = descriptionRef.current;
    if (!node || descriptionOpen) return;
    const measure = () => setDescriptionLong(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [product?.id, product?.description, descriptionOpen]);

  useEffect(() => {
    if (!product || zoomOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose, zoomOpen]);

  if (!product) return null;
  const stock = stockStatus(product.stock);
  const offer = hasOffer(product);
  const countdown = offer ? offerCountdownLabel(product.offer_ends_at) : null;
  const gallery = product.images.length > 0 ? product.images : [firstImage(product)];
  const related = relatedProducts(product, products);

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
        <div className="quick-view-scroll" ref={scrollRef}>
          <div className="quick-view-image" style={{ background: pastelBackground(product.id) }}>
            <ImagePager
              images={gallery}
              alt={`${product.name} jewellery`}
              index={activeIndex}
              onIndexChange={setActiveIndex}
              onImageClick={() => setZoomOpen(true)}
              showDots={false}
              eager
            />
            <button type="button" className="quick-view-zoom" onClick={() => setZoomOpen(true)} aria-label="Zoom photo">
              <ZoomIn size={16} />
            </button>
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
            {product.description && (
              <div className="quick-view-description-wrap">
                <p
                  ref={descriptionRef}
                  id="quick-view-description"
                  className={`quick-view-description ${descriptionOpen ? "is-open" : ""}`}
                >
                  {product.description}
                </p>
                {(descriptionLong || descriptionOpen) && (
                  <button
                    type="button"
                    className="read-more"
                    aria-expanded={descriptionOpen}
                    aria-controls="quick-view-description"
                    onClick={() => setDescriptionOpen((open) => !open)}
                  >
                    {descriptionOpen ? "Read less" : "Read more"}
                  </button>
                )}
              </div>
            )}
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
                aria-label={isWishlisted ? "Saved to wishlist" : "Save to wishlist"}
              >
                <Heart size={16} /> <span>{isWishlisted ? "Saved" : "Save"}</span>
              </button>
              <button type="button" className="wishlist-toggle" onClick={() => share(product)} aria-label="Share">
                <Share2 size={16} /> <span>Share</span>
              </button>
            </div>
            {shareNote && (
              <p className="quick-view-share-note" aria-live="polite">
                {shareNote}
              </p>
            )}
            {related.length > 0 && (
              <div className="quick-view-related">
                <p className="eyebrow">You may also like</p>
                <div className="recently-viewed-row">
                  {related.map((item) => {
                    const image = firstImage(item);
                    return (
                      <button type="button" key={item.id} className="recent-item" onClick={() => onOpenProduct(item)}>
                        <span className="recent-thumb" style={{ background: pastelBackground(item.id) }}>
                          <img src={image} alt="" className={isCutoutImage(image) ? "is-cutout" : ""} loading="lazy" />
                        </span>
                        <span className="recent-name">{item.name}</span>
                        <span className="recent-price">₹{effectivePrice(item)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {zoomOpen && (
        <ImageZoomViewer
          images={gallery}
          startIndex={activeIndex}
          alt={`${product.name} jewellery`}
          cutoutBackground={pastelBackground(product.id)}
          onClose={(index) => {
            setZoomOpen(false);
            setActiveIndex(index);
          }}
        />
      )}
    </div>
  );
}
