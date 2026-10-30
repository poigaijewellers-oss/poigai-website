import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Testimonial } from "../lib/types";

export function useAdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setTestimonials([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setTestimonials(error || !data ? [] : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { testimonials, loading, refresh };
}
