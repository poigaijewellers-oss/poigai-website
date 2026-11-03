import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoSiteSettings } from "../data/demoData";
import type { SiteSettings } from "../lib/types";

const CACHE_KEY = "poigai-site-settings";

// Last settings seen on this device, so a repeat visit shows the real hero photo and text straight away.
function readCachedSettings(): SiteSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteSettings) : null;
  } catch {
    return null;
  }
}

function cacheSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked (private mode): the page simply waits for the network next time.
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => readCachedSettings() ?? demoSiteSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setSettings(demoSiteSettings);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error || !data) {
      setSettings(readCachedSettings() ?? demoSiteSettings);
    } else {
      setSettings(data);
      cacheSettings(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, refresh, isLive: isSupabaseConfigured };
}
