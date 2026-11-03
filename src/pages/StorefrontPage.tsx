import { useCallback, useEffect, useMemo, useState } from "react";
import { FloatingChat } from "../components/layout/FloatingChat";
import { RecentlyViewed } from "../components/storefront/RecentlyViewed";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { AnnouncementBar } from "../components/layout/AnnouncementBar";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { KolamDivider } from "../components/common/KolamDivider";
import { Reveal } from "../components/common/Reveal";
import { Hero } from "../components/storefront/Hero";
import { BrandStory } from "../components/storefront/BrandStory";
import { BrandStatement } from "../components/storefront/BrandStatement";
import { ProductShelves } from "../components/storefront/ProductShelves";
import { ProductToolbar, type SortOption } from "../components/storefront/ProductToolbar";
import { ProductGrid } from "../components/storefront/ProductGrid";
import { ProductQuickView } from "../components/storefront/ProductQuickView";
import { WishlistDrawer } from "../components/storefront/WishlistDrawer";
import { Testimonials } from "../components/storefront/Testimonials";
import { FeedbackForm } from "../components/storefront/FeedbackForm";
import { ReelsSection } from "../components/storefront/ReelsSection";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { useWishlist } from "../hooks/useWishlist";
import { useTestimonials } from "../hooks/useTestimonials";
import { useReels } from "../hooks/useReels";
import { useNowTick } from "../hooks/useNowTick";
import { useImageProtection } from "../hooks/useImageProtection";
import { effectivePrice, enquireAboutWishlist, enquireOnWhatsApp } from "../lib/productUtils";
import type { HomepageSection, Product } from "../lib/types";

export default function StorefrontPage() {
  useNowTick(); // keeps offer countdowns fresh without a full page refresh
  useImageProtection();

  const { products, loading, isLive } = useProducts();
  const { categories } = useCategories();
  const { settings } = useSiteSettings();
  const { wishlist, toggle, clear } = useWishlist();
  const { testimonials, loading: testimonialsLoading } = useTestimonials();
  const { reels, loading: reelsLoading } = useReels();
  const { recent, remember } = useRecentlyViewed();
  const hiddenSections = settings.hidden_sections ?? [];
  const show = (section: HomepageSection) => !hiddenSections.includes(section);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Only count favourites that are still in the shop (a piece may have been removed since).
  const wishlistCount = products.filter((product) => wishlist.includes(product.id)).length;
  const recentProducts = recent
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  const openProduct = useCallback(
    (product: Product) => {
      setQuickViewProduct(product);
      remember(product.id);
      const url = new URL(window.location.href);
      url.searchParams.set("p", product.id);
      window.history.replaceState(null, "", url);
    },
    [remember],
  );

  const closeProduct = useCallback(() => {
    setQuickViewProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    window.history.replaceState(null, "", url);
  }, []);

  // A shared link (?p=<id>) opens that piece straight away.
  useEffect(() => {
    if (loading) return;
    const sharedId = new URLSearchParams(window.location.search).get("p");
    if (!sharedId) return;
    const shared = products.find((product) => product.id === sharedId);
    if (shared) openProduct(shared);
  }, [loading]); // run once, as soon as products have loaded

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
        sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
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
    <main className="storefront">
      <AnnouncementBar text={settings.announcement_text} />
      <SiteHeader
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setWishlistOpen(true)}
        onEnquire={() => handleEnquire()}
        hiddenSections={hiddenSections}
      />
      <Hero settings={settings} />

      {show("values_strip") && (
        <div className="values-strip" aria-label="POIGAI values">
          <span>CURATED WITH CARE</span>
          <b>✦</b>
          <span>EVERYDAY ELEGANCE</span>
          <b>✦</b>
          <span>CHOSEN FOR YOU</span>
        </div>
      )}

      {!loading && (
        <ProductShelves
          products={products}
          wishlistIds={wishlist}
          onToggleWishlist={toggle}
          onQuickView={openProduct}
          onEnquire={handleEnquire}
          showNewArrivals={show("new_arrivals")}
          showBestsellers={show("bestsellers")}
        />
      )}

      {show("brand_statement") && <BrandStatement />}

      <section className="shop-section" id="shop">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p>
            <h2>
              The POIGAI <em>edit.</em>
            </h2>
          </div>
          <p className="section-aside">Small details. Beautifully yours.</p>
        </Reveal>

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
          onQuickView={openProduct}
          onEnquire={handleEnquire}
          loading={loading}
        />

        {show("recently_viewed") && <RecentlyViewed products={recentProducts} onOpen={openProduct} />}

        {!isLive && (
          <p className="preview-note">
            These are sample preview products and prices. Connect Supabase (see SUPABASE_SETUP.md) and add your
            real products from the admin panel at <code>/admin</code> to replace them.
          </p>
        )}
      </section>

      {show("brand_story") && (
        <>
          <KolamDivider />
          <BrandStory />
        </>
      )}
      <KolamDivider />

      {show("reels") && <ReelsSection reels={reels} loading={reelsLoading} />}

      {show("testimonials") && <Testimonials testimonials={testimonials} loading={testimonialsLoading} />}

      {show("feedback_form") && (
        <section className="feedback-cta">
          <FeedbackForm />
        </section>
      )}

      <SiteFooter settings={settings} onEnquire={() => handleEnquire()} />

      <ProductQuickView
        product={quickViewProduct}
        onClose={closeProduct}
        onEnquire={(product) => handleEnquire(product)}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={toggle}
        products={products}
        onOpenProduct={openProduct}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={products}
        wishlistIds={wishlist}
        onRemove={toggle}
        onClear={clear}
        onEnquire={(product) => handleEnquire(product)}
        onEnquireAll={(items) => enquireAboutWishlist(settings.whatsapp_number, items)}
        onOpenProduct={(product) => {
          setWishlistOpen(false);
          openProduct(product);
        }}
      />

      <FloatingChat onClick={() => handleEnquire()} />
    </main>
  );
}
