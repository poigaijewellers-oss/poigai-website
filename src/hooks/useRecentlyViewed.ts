import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "poigai-recently-viewed";
const LIMIT = 8;

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<string[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      // Private browsing or full storage — the row simply won't persist.
    }
  }, [recent]);

  const remember = useCallback((id: string) => {
    setRecent((current) => [id, ...current.filter((existing) => existing !== id)].slice(0, LIMIT));
  }, []);

  return { recent, remember };
}
