import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoSiteSettings } from "../data/demoData";
import type { SiteSettings } from "../lib/types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(demoSiteSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setSettings(demoSiteSettings);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    setSettings(error || !data ? demoSiteSettings : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, refresh, isLive: isSupabaseConfigured };
}
