import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Menu, MessageCircle, X } from "lucide-react";

type SiteHeaderProps = {
  wishlistCount: number;
  onOpenWishlist: () => void;
  onEnquire: () => void;
};

const NAV_LINKS = [
  { href: "#shop", label: "Shop" },
  { href: "#story", label: "Our story" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader({ wishlistCount, onOpenWishlist, onEnquire }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <button
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
      </button>

      <nav className="site-nav" aria-label="Main navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <Link className="brand" to="/" aria-label="POIGAI home">
        <img src="/poigai-logo-mark.png" alt="POIGAI — அழகு மலரும் இடம்" />
      </Link>

      <div className="header-actions">
        <button className="icon-button" aria-label={`Wishlist, ${wishlistCount} saved`} onClick={onOpenWishlist}>
          <Heart size={17} strokeWidth={1.6} />
          {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
        </button>
        <button className="header-order" onClick={onEnquire}>
          <MessageCircle size={16} strokeWidth={1.6} /> <span>Order with us</span>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav" role="dialog" aria-label="Site menu">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
