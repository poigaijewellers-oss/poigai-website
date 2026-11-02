import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isCutoutImage } from "../../lib/productUtils";

type ImagePagerProps = {
  images: string[];
  alt: string;
  index?: number;
  onIndexChange?: (index: number) => void;
  onImageClick?: () => void;
  showDots?: boolean;
  eager?: boolean;
};

// Swipe (touch), scroll (trackpad) or tap the arrows (mouse) through a product's photos.
export function ImagePager({ images, alt, index, onIndexChange, onImageClick, showDots = true, eager }: ImagePagerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = Math.round(track.scrollLeft / track.clientWidth);
        setCurrent((previous) => (previous === next ? previous : next));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    onIndexChangeRef.current?.(current);
  }, [current]);

  useEffect(() => {
    const track = trackRef.current;
    if (index === undefined || !track) return;
    if (Math.round(track.scrollLeft / track.clientWidth) !== index) {
      track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    }
  }, [index]);

  function step(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(images.length - 1, current + direction));
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  }

  const several = images.length > 1;

  return (
    <div className="pager">
      <div className="pager-track" ref={trackRef}>
        {images.map((src, i) => (
          <div className="pager-slide" key={`${src}-${i}`}>
            <img
              src={src}
              alt={i === 0 ? alt : `${alt}, photo ${i + 1}`}
              loading={eager || i === 0 ? "eager" : "lazy"}
              className={isCutoutImage(src) ? "is-cutout" : ""}
              draggable={false}
              onClick={onImageClick}
            />
          </div>
        ))}
      </div>
      {several && (
        <>
          <button
            type="button"
            className="pager-arrow pager-prev"
            onClick={() => step(-1)}
            disabled={current === 0}
            aria-label="Previous photo"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="pager-arrow pager-next"
            onClick={() => step(1)}
            disabled={current === images.length - 1}
            aria-label="Next photo"
          >
            <ChevronRight size={16} />
          </button>
          {showDots && (
            <div className="pager-dots" aria-hidden="true">
              {images.map((src, i) => (
                <span key={`${src}-dot-${i}`} className={i === current ? "is-active" : ""} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
