import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoCategories } from "../data/demoData";
import type { Category } from "../lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setCategories(demoCategories);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    setCategories(error || !data ? demoCategories : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, refresh, isLive: isSupabaseConfigured };
}
