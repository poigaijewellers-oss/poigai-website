import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";
import { createProduct, updateProduct, uploadProductImage } from "../../lib/adminApi";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import type { Category, Product } from "../../lib/types";

type ProductFormProps = {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
};

export function ProductForm({ product, categories, onClose, onSaved }: ProductFormProps) {
  useBodyScrollLock(true);

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [offerPrice, setOfferPrice] = useState(product?.offer_price != null ? String(product.offer_price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [label, setLabel] = useState(product?.label ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      setImages((current) => [...current, url]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((image) => image !== url));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const input = {
      name: name.trim(),
      category_id: categoryId || null,
      description: description.trim(),
      price: Number(price),
      offer_price: offerPrice ? Number(offerPrice) : null,
      stock: Number(stock),
      images,
      label: label.trim(),
      is_featured: isFeatured,
      is_active: isActive,
    };
    try {
      if (product) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }
      onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Couldn't save this product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={product ? "Edit product" : "Add product"}>
      <div className="admin-modal-backdrop" onClick={onClose} />
      <form className="admin-modal-panel" onSubmit={handleSubmit}>
        <div className="admin-modal-header">
          <h3>{product ? "Edit product" : "Add product"}</h3>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label>
          Category
          <select value={categoryId ?? ""} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-form-row">
          <label>
            Price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          <label>
            Offer price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerPrice}
              onChange={(event) => setOfferPrice(event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </label>
        </div>

        <label>
          Label (optional badge, e.g. "Just arrived")
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description ?? ""} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </label>

        <div className="admin-image-field">
          <span>Images</span>
          <div className="admin-image-list">
            {images.map((url) => (
              <div key={url} className="admin-image-thumb">
                <img src={url} alt="" />
                <button type="button" onClick={() => removeImage(url)} aria-label="Remove image">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          {uploading && <span className="admin-upload-status">Uploading…</span>}
        </div>

        <div className="admin-form-row admin-form-toggles">
          <label className="admin-checkbox">
            <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
            Featured
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Visible on site
          </label>
        </div>

        {error && <p className="admin-form-error">{error}</p>}

        <div className="admin-modal-actions">
          <button type="button" className="admin-secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}
