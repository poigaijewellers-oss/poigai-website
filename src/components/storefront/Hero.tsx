import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { SiteSettings } from "../../lib/types";

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400&q=90";

type HeroProps = {
  settings: SiteSettings;
  // False while the saved settings are still loading: show a soft placeholder rather than the default photo.
  settingsReady: boolean;
};

export function Hero({ settings, settingsReady }: HeroProps) {
  const [headingLine, ...rest] = settings.hero_heading.split("\n");
  const emphasisLine = rest.join(" ");
  const heroImage = settings.hero_image_url || (settingsReady ? DEFAULT_HERO_IMAGE : null);
  const [loadedImage, setLoadedImage] = useState<string | null>(null);

  return (
    <section className="hero">
      <div className="floating-sparkles" aria-hidden="true">
        <span>✦</span>
        <span>✧</span>
        <span>✦</span>
        <span>✧</span>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">THE EVERYDAY JEWELLERY EDIT</p>
        <h1>
          {headingLine}
          {emphasisLine && (
            <>
              <br />
              <em>{emphasisLine}</em>
            </>
          )}
        </h1>
        <p className="hero-description">{settings.hero_subheading}</p>
        <a className="primary-link" href="#shop">
          Explore the collection <ArrowRight size={16} />
        </a>
        <p className="tamil-line">அழகு மலரும் இடம்.</p>
      </div>
      <div className="hero-visual">
        <div className="hero-photo">
          {heroImage && (
            <img
              key={heroImage}
              src={heroImage}
              alt={settings.hero_image_url ? "POIGAI jewellery" : "Elegant gold-tone jewellery on a warm neutral background"}
              className={loadedImage === heroImage ? "is-loaded" : ""}
              {...{ fetchpriority: "high" }} // React 18 only passes the lower-case attribute through
              draggable={false}
              onLoad={() => setLoadedImage(heroImage)}
            />
          )}
        </div>
        <div className="hero-note">
          <span>THE POIGAI PROMISE</span>
          <strong>
            Made to
            <br />
            feel yours.
          </strong>
          <i>EVERYDAY · ELEGANT · YOU</i>
        </div>
      </div>
    </section>
  );
}
