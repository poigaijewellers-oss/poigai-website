import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { deleteProduct, setProductActive } from "../../lib/adminApi";
import { firstImage } from "../../lib/productUtils";
import { ProductForm } from "./ProductForm";
import type { Product } from "../../lib/types";

export default function ProductsManager() {
  const { products, loading, refresh } = useProducts({ includeInactive: true });
  const { categories } = useCategories();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleToggleActive(product: Product) {
    setBusyId(product.id);
    try {
      await setProductActive(product.id, !product.is_active);
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn't change this product's status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setBusyId(product.id);
    try {
      await deleteProduct(product.id);
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn't delete this product.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Products</h2>
        <button className="admin-primary-button" onClick={() => setCreating(true)}>
          <Plus size={15} /> Add product
        </button>
      </div>

      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p>No products yet. Add your first one.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={firstImage(product)} alt="" className="admin-thumb" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category_name ?? "—"}</td>
                  <td>
                    {product.offer_price ? (
                      <>
                        ₹{product.offer_price} <s>₹{product.price}</s>
                      </>
                    ) : (
                      <>₹{product.price}</>
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.is_active}
                      aria-label={`${product.name}: ${product.is_active ? "shown on the website" : "hidden from the website"}`}
                      className={`admin-toggle ${product.is_active ? "is-on" : ""}`}
                      onClick={() => handleToggleActive(product)}
                      disabled={busyId === product.id}
                    >
                      <span className="admin-toggle-track" aria-hidden="true" />
                      <span>{product.is_active ? "Active" : "Hidden"}</span>
                    </button>
                  </td>
                  <td className="admin-row-actions">
                    <button aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label={`Delete ${product.name}`}
                      onClick={() => handleDelete(product)}
                      disabled={busyId === product.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </section>
  );
}
