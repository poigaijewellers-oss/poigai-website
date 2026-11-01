import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Reel } from "../lib/types";

export function useAdminReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setReels([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("reels").select("*").order("sort_order", { ascending: true });
    setReels(error || !data ? [] : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reels, loading, refresh };
}
