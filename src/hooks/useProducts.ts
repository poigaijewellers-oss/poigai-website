import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoProducts } from "../data/demoData";
import type { Product } from "../lib/types";

export function useProducts(options: { includeInactive?: boolean } = {}) {
  const { includeInactive = false } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const fallback = includeInactive ? demoProducts : demoProducts.filter((product) => product.is_active);

    if (!supabase) {
      setProducts(fallback);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (!includeInactive) query = query.eq("is_active", true);

    const { data, error: fetchError } = await query;
    if (fetchError || !data) {
      setError(fetchError?.message ?? "Couldn't load products.");
      setProducts(fallback);
    } else {
      const mapped: Product[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        category_name: row.categories?.name ?? null,
        description: row.description,
        price: Number(row.price),
        offer_price: row.offer_price === null ? null : Number(row.offer_price),
        stock: row.stock,
        images: row.images ?? [],
        label: row.label,
        is_featured: row.is_featured,
        is_active: row.is_active,
        offer_ends_at: row.offer_ends_at,
        is_combo: row.is_combo,
        combo_includes: row.combo_includes,
        created_at: row.created_at,
      }));
      setProducts(mapped);
    }
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, loading, error, refresh, isLive: isSupabaseConfigured };
}
