import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoReels } from "../data/demoData";
import type { Reel } from "../lib/types";

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setReels(demoReels);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("reels")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setReels(error || !data ? demoReels : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reels, loading, refresh, isLive: isSupabaseConfigured };
}
