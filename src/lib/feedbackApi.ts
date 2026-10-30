import { supabase } from "./supabaseClient";

export type TestimonialInput = {
  customer_name: string;
  message: string;
  rating: number;
};

export async function submitTestimonial(input: TestimonialInput) {
  if (!supabase) {
    throw new Error("Feedback isn't available in preview mode yet — connect Supabase first.");
  }
  const { error } = await supabase.from("testimonials").insert({ ...input, is_approved: false });
  if (error) throw error;
}
