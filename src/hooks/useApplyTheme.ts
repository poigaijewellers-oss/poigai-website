import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

export function useApplyTheme() {
  const { settings } = useSiteSettings();
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme_primary) root.style.setProperty("--maroon", settings.theme_primary);
    if (settings.theme_accent) root.style.setProperty("--gold", settings.theme_accent);
  }, [settings]);
}
