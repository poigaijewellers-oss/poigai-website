import { useMemo, useState } from "react";
import { AnnouncementBar } from "../components/layout/AnnouncementBar";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Hero } from "../components/storefront/Hero";
import { BrandStory } from "../components/storefront/BrandStory";
import { ProductToolbar, type SortOption } from "../components/storefront/ProductToolbar";
import { ProductGrid } from "../components/storefront/ProductGrid";
import { ProductQuickView } from "../components/storefront/ProductQuickView";
import { WishlistDrawer } from "../components/storefront/WishlistDrawer";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { useWishlist } from "../hooks/useWishlist";
import { enquireOnWhatsApp } from "../lib/productUtils";
import type { Product } from "../lib/types";

export default function StorefrontPage() {
  const { products, loading, isLive } = useProducts();
  const { categories } = useCategories();
  const { settings } = useSiteSettings();
  const { wishlist, toggle, count } = useWishlist();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    let list = products;

    if (activeCategory !== "all") {
      list = list.filter((product) => product.category_id === activeCategory);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(q) || (product.category_name ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => (a.offer_price ?? a.price) - (b.offer_price ?? b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.offer_price ?? b.price) - (a.offer_price ?? a.price));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return sorted;
  }, [products, activeCategory, query, sort]);

  function handleEnquire(product?: Product) {
    enquireOnWhatsApp(settings.whatsapp_number, product);
  }

  return (
    <main>
      <AnnouncementBar text={settings.announcement_text} />
      <SiteHeader wishlistCount={count} onOpenWishlist={() => setWishlistOpen(true)} onEnquire={() => handleEnquire()} />
      <Hero settings={settings} />

      <div className="values-strip" aria-label="POIGAI values">
        <span>CURATED WITH CARE</span>
        <b>✦</b>
        <span>EVERYDAY ELEGANCE</span>
        <b>✦</b>
        <span>CHOSEN FOR YOU</span>
      </div>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p>
            <h2>
              The POIGAI <em>edit.</em>
            </h2>
          </div>
          <p className="section-aside">Small details. Beautifully yours.</p>
        </div>

        <ProductToolbar
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sort={sort}
          onSortChange={setSort}
          resultCount={visibleProducts.length}
        />

        <ProductGrid
          products={visibleProducts}
          wishlistIds={wishlist}
          onToggleWishlist={toggle}
          onQuickView={setQuickViewProduct}
          onEnquire={handleEnquire}
          loading={loading}
        />

        {!isLive && (
          <p className="preview-note">
            These are sample preview products and prices. Connect Supabase (see SUPABASE_SETUP.md) and add your
            real products from the admin panel at <code>/admin</code> to replace them.
          </p>
        )}
      </section>

      <BrandStory />
      <SiteFooter settings={settings} onEnquire={() => handleEnquire()} />

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onEnquire={(product) => handleEnquire(product)}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={toggle}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={products}
        wishlistIds={wishlist}
        onRemove={toggle}
        onEnquire={(product) => handleEnquire(product)}
      />
    </main>
  );
}
