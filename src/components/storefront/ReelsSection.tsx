import { useEffect } from "react";
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

  if (loading || reels.length === 0) return null;

  return (
    <section className="reels-section" id="reels">
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">ரீல்ஸ் பாருங்கள்</p>
          <h2>
            Watch our <em>reels.</em>
          </h2>
        </div>
        <p className="section-aside">A little behind the scenes.</p>
      </Reveal>
      <div className="reels-grid">
        {reels.map((reel) => (
          <div className="reel-card" key={reel.id}>
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
    </section>
  );
}
