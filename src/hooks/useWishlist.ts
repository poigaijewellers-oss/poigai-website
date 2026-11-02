import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "poigai-wishlist";

function readStoredWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => readStoredWishlist());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Private browsing / storage quota — wishlist just won't persist this session.
    }
  }, [wishlist]);

  const toggle = useCallback((id: string) => {
    setWishlist((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    );
  }, []);

  const clear = useCallback(() => setWishlist([]), []);

  return { wishlist, toggle, clear, count: wishlist.length };
}
