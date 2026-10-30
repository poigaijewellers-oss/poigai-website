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
  created_at: string;
}

export interface SiteSettings {
  announcement_text: string;
  whatsapp_number: string;
  hero_heading: string;
  hero_subheading: string;
  instagram_url: string;
}
