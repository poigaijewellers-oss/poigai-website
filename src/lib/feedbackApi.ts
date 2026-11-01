import { supabase } from "./supabaseClient";
import { compressImage } from "./imageCompression";

export type TestimonialInput = {
  customer_name: string;
  message: string;
  rating: number;
  image_url?: string | null;
};

export async function submitTestimonial(input: TestimonialInput) {
  if (!supabase) {
    throw new Error("Feedback isn't available in preview mode yet — connect Supabase first.");
  }
  const { error } = await supabase.from("testimonials").insert({ ...input, is_approved: false });
  if (error) throw error;
}

export async function uploadFeedbackImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Photo uploads aren't available in preview mode yet — connect Supabase first.");
  }
  const compressed = await compressImage(file);
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("feedback-images").upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("feedback-images").getPublicUrl(path);
  return data.publicUrl;
}
