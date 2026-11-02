import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { SiteSettings } from "../../lib/types";

type HeroProps = {
  settings: SiteSettings;
};

export function Hero({ settings }: HeroProps) {
  const [headingLine, ...rest] = settings.hero_heading.split("\n");
  const emphasisLine = rest.join(" ");

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
      <div
        className="hero-visual"
        role="img"
        aria-label={settings.hero_image_url ? "POIGAI jewellery" : "Elegant gold-tone jewellery on a warm neutral background"}
        style={
          settings.hero_image_url
            ? ({ "--hero-image": `url(${JSON.stringify(settings.hero_image_url)})` } as CSSProperties)
            : undefined
        }
      >
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
