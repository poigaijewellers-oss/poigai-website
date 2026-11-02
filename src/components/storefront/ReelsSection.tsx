import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Reel } from "../../lib/types";
import { Reveal } from "../common/Reveal";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

type ReelsSectionProps = {
  reels: Reel[];
  loading: boolean;
};

export function ReelsSection({ reels, loading }: ReelsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    if (reels.length === 0) return;
    if (document.getElementById("instagram-embed-script")) {
      window.instgrm?.Embeds.process();
      return;
    }
    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [reels]);

  // Track which reel sits nearest the middle, and whether there's more to scroll either way.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = Array.from(track.children) as HTMLElement[];
      const middle = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });
      // Measure the reels themselves (not the track's padding) to decide whether a carousel is needed.
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const contentWidth = cards.reduce((sum, card) => sum + card.offsetWidth, 0) + gap * Math.max(0, cards.length - 1);
      const needsScroll = contentWidth > track.clientWidth - 8;
      setOverflowing(needsScroll);
      setActive(closest);
      setCanPrev(needsScroll && track.scrollLeft > 4);
      setCanNext(needsScroll && track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Instagram swaps each placeholder for a taller player once it loads, so re-measure then too.
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(track);
    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [reels, loading]);

  function goTo(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  }

  if (loading || reels.length === 0) return null;

  return (
    <section className="reels-section" id="reels">
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow" lang="ta">ரீல்ஸ் பாருங்கள்</p>
          <h2>
            Watch our <em>reels.</em>
          </h2>
        </div>
        <p className="section-aside">A little behind the scenes.</p>
      </Reveal>

      <div className={`reels-carousel ${overflowing ? "is-scrollable" : ""}`}>
        <button
          type="button"
          className="reels-arrow reels-arrow-prev"
          onClick={() => goTo(Math.max(0, active - 1))}
          disabled={!canPrev}
          aria-label="Previous reel"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={trackRef}
          className={`reels-track ${canPrev ? "fade-start" : ""} ${canNext ? "fade-end" : ""}`}
          aria-label="Instagram reels"
        >
          {reels.map((reel, index) => (
            <div
              className={`reel-card ${overflowing && index === active ? "is-active" : ""}`}
              key={reel.id}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={reel.instagram_url}
                data-instgrm-version="14"
              >
                <a href={reel.instagram_url} target="_blank" rel="noreferrer">
                  {reel.caption || "View on Instagram"}
                </a>
              </blockquote>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="reels-arrow reels-arrow-next"
          onClick={() => goTo(Math.min(reels.length - 1, active + 1))}
          disabled={!canNext}
          aria-label="Next reel"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {overflowing && (
        <div className="reels-dots" role="tablist" aria-label="Choose a reel">
          {reels.map((reel, index) => (
            <button
              type="button"
              key={reel.id}
              role="tab"
              aria-selected={index === active}
              aria-label={`Reel ${index + 1}`}
              className={index === active ? "is-active" : ""}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
