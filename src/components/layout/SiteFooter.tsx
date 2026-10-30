import { Instagram, MessageCircle } from "lucide-react";
import type { SiteSettings } from "../../lib/types";

type SiteFooterProps = {
  settings: SiteSettings;
  onEnquire: () => void;
};

export function SiteFooter({ settings, onEnquire }: SiteFooterProps) {
  return (
    <footer id="contact">
      <div className="footer-brand">
        <img src="/poigai-logo-mark.png" alt="POIGAI" />
        <p>Everyday jewellery, chosen with love.</p>
      </div>
      <div className="footer-actions">
        <a href={settings.instagram_url} target="_blank" rel="noreferrer">
          <Instagram size={16} /> Follow POIGAI
        </a>
        <button onClick={onEnquire}>
          <MessageCircle size={16} /> Chat with us on WhatsApp
        </button>
      </div>
      <small>© {new Date().getFullYear()} POIGAI. All rights reserved.</small>
    </footer>
  );
}
