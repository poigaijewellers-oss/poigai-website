import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { demoTestimonials } from "../data/demoData";
import type { Testimonial } from "../lib/types";

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setTestimonials(demoTestimonials);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(12);
    setTestimonials(error || !data ? demoTestimonials : data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { testimonials, loading, refresh, isLive: isSupabaseConfigured };
}
