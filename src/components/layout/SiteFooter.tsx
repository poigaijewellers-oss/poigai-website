import { Instagram, MessageCircle } from "lucide-react";
import type { SiteSettings } from "../../lib/types";
import { KolamDivider } from "../common/KolamDivider";

type SiteFooterProps = {
  settings: SiteSettings;
  onEnquire: () => void;
};

const FOOTER_LINKS = [
  { href: "#shop", label: "Shop" },
  { href: "#story", label: "Our story" },
  { href: "#reels", label: "Reels" },
  { href: "#feedback", label: "Feedback" },
];

export function SiteFooter({ settings, onEnquire }: SiteFooterProps) {
  return (
    <>
      <KolamDivider />
      <footer id="contact">
        <div className="footer-glow" aria-hidden="true" />
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/poigai-logo-mark.png" alt="POIGAI" />
            <p>Everyday jewellery, chosen with love.</p>
            <span className="footer-tamil">அழகு மலரும் இடம்.</span>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <nav>
              {FOOTER_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-col">
            <h4>Say hello</h4>
            <div className="footer-actions">
              <button onClick={onEnquire}>
                <MessageCircle size={16} /> Chat on WhatsApp
              </button>
              <a href={settings.instagram_url} target="_blank" rel="noreferrer">
                <Instagram size={16} /> Follow POIGAI
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-stay">Stay with us… ✦</span>
          <small>© {new Date().getFullYear()} POIGAI. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
}
