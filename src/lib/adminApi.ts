import { supabase } from "./supabaseClient";
import { compressImage } from "./imageCompression";
import type { SiteSettings } from "./types";

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase isn't configured yet. Add your project URL and anon key to .env.");
  }
  return supabase;
}

export type ProductInput = {
  name: string;
  category_id: string | null;
  description: string;
  price: number;
  offer_price: number | null;
  stock: number;
  images: string[];
  label: string;
  is_featured: boolean;
  is_active: boolean;
  offer_ends_at: string | null;
  is_combo: boolean;
  combo_includes: string | null;
};

export async function createProduct(input: ProductInput) {
  const client = requireClient();
  const { data, error } = await client.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: ProductInput) {
  const client = requireClient();
  const { data, error } = await client.from("products").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const client = requireClient();
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const client = requireClient();
  const compressed = await compressImage(file);
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("product-images").upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = client.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createCategory(name: string, sortOrder: number) {
  const client = requireClient();
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const { data, error } = await client
    .from("categories")
    .insert({ name: name.trim(), slug, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const client = requireClient();
  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSiteSettings(settings: SiteSettings) {
  const client = requireClient();
  const { error } = await client.from("site_settings").update(settings).eq("id", 1);
  if (error) throw error;
}

export async function approveTestimonial(id: string) {
  const client = requireClient();
  const { error } = await client.from("testimonials").update({ is_approved: true }).eq("id", id);
  if (error) throw error;
}

export async function deleteTestimonial(id: string) {
  const client = requireClient();
  const { error } = await client.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}

export async function createReel(input: { instagram_url: string; caption: string; sort_order: number }) {
  const client = requireClient();
  const { data, error } = await client.from("reels").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReel(id: string) {
  const client = requireClient();
  const { error } = await client.from("reels").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleReelActive(id: string, isActive: boolean) {
  const client = requireClient();
  const { error } = await client.from("reels").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}
