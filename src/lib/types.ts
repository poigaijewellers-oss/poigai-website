export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  category_name?: string | null;
  description: string | null;
  price: number;
  offer_price: number | null;
  stock: number;
  images: string[];
  label: string | null;
  is_featured: boolean;
  is_active: boolean;
  offer_ends_at: string | null;
  is_combo: boolean;
  combo_includes: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  message: string;
  rating: number;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Reel {
  id: string;
  instagram_url: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  announcement_text: string;
  whatsapp_number: string;
  hero_heading: string;
  hero_subheading: string;
  instagram_url: string;
  theme_primary: string;
  theme_accent: string;
}
