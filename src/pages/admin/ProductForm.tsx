import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { createProduct, updateProduct, uploadProductImage } from "../../lib/adminApi";
import { removeBackground } from "../../lib/backgroundRemoval";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { isCutoutImage, pastelBackground, toDatetimeLocalValue } from "../../lib/productUtils";
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
  const [offerEndsAt, setOfferEndsAt] = useState(toDatetimeLocalValue(product?.offer_ends_at ?? null));
  const [isCombo, setIsCombo] = useState(product?.is_combo ?? false);
  const [comboIncludes, setComboIncludes] = useState(product?.combo_includes ?? "");
  const [uploading, setUploading] = useState(false);
  const [removeBg, setRemoveBg] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toCutout(source: Blob, prefix: string): Promise<File> {
    const blob = await removeBackground(source, (message) => setStatus(prefix + message));
    const extension = blob.type === "image/webp" ? "webp" : "png";
    return new File([blob], `cutout.${extension}`, { type: blob.type });
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const [index, file] of files.entries()) {
        const prefix = files.length > 1 ? `Photo ${index + 1} of ${files.length}: ` : "";
        let url: string;
        if (removeBg) {
          try {
            const cutout = await toCutout(file, prefix);
            setStatus(`${prefix}Uploading…`);
            url = await uploadProductImage(cutout, { cutout: true });
          } catch (bgError) {
            const reason = bgError instanceof Error ? bgError.message : "Background removal didn't work.";
            setError(`${reason} The original photo was uploaded instead.`);
            setStatus(`${prefix}Uploading original…`);
            url = await uploadProductImage(file);
          }
        } else {
          setStatus(`${prefix}Uploading…`);
          url = await uploadProductImage(file);
        }
        setImages((current) => [...current, url]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      setStatus(null);
      event.target.value = "";
    }
  }

  async function removeBackgroundFrom(url: string) {
    setUploading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Couldn't load that photo.");
      const cutout = await toCutout(await response.blob(), "");
      setStatus("Uploading…");
      const newUrl = await uploadProductImage(cutout, { cutout: true });
      setImages((current) => current.map((image) => (image === url ? newUrl : image)));
    } catch (bgError) {
      setError(bgError instanceof Error ? bgError.message : "Background removal didn't work.");
    } finally {
      setUploading(false);
      setStatus(null);
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
      offer_ends_at: offerPrice && offerEndsAt ? new Date(offerEndsAt).toISOString() : null,
      is_combo: isCombo,
      combo_includes: isCombo ? comboIncludes.trim() || null : null,
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
          {offerPrice && (
            <label>
              Offer ends (optional)
              <input
                type="datetime-local"
                value={offerEndsAt}
                onChange={(event) => setOfferEndsAt(event.target.value)}
              />
            </label>
          )}
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
          <span>Images (the first one is the main photo)</span>
          <div className="admin-image-list">
            {images.map((url) => {
              const cutout = isCutoutImage(url);
              return (
                <div key={url} className="admin-image-thumb" style={cutout ? { background: pastelBackground(url) } : undefined}>
                  <img src={url} alt="" className={cutout ? "is-cutout" : ""} />
                  <button
                    type="button"
                    className="admin-thumb-remove"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                  {!cutout && (
                    <button
                      type="button"
                      className="admin-thumb-cutout"
                      onClick={() => removeBackgroundFrom(url)}
                      disabled={uploading}
                      aria-label="Remove this photo's background"
                      title="Remove background"
                    >
                      <Sparkles size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <label className="admin-checkbox admin-bg-toggle">
            <input type="checkbox" checked={removeBg} onChange={(event) => setRemoveBg(event.target.checked)} />
            Remove background and show on a pastel backdrop
          </label>
          <p className="admin-hint">
            Runs on this device, free. The first time it downloads the remover (about 90 MB). Takes a few seconds per
            photo on a laptop or desktop. Best results: one piece on a plain background, in good light.
          </p>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
          {status && <span className="admin-upload-status">{status}</span>}
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
          <label className="admin-checkbox">
            <input type="checkbox" checked={isCombo} onChange={(event) => setIsCombo(event.target.checked)} />
            Combo / set
          </label>
        </div>

        {isCombo && (
          <label>
            What's included (shown to customers)
            <input
              value={comboIncludes}
              onChange={(event) => setComboIncludes(event.target.value)}
              placeholder="e.g. Necklace, matching earrings & gift box"
            />
          </label>
        )}

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
