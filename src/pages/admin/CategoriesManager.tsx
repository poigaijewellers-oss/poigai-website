import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { createCategory, deleteCategory } from "../../lib/adminApi";

export default function CategoriesManager() {
  const { categories, loading, refresh } = useCategories();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCategory(name, categories.length + 1);
      setName("");
      await refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Couldn't add this category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, categoryName: string) {
    if (!window.confirm(`Delete category "${categoryName}"? Products in it will become uncategorised.`)) return;
    try {
      await deleteCategory(id);
      await refresh();
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Couldn't delete this category.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Categories</h2>
      </div>

      <form className="admin-inline-form" onSubmit={handleCreate}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Bangles"
          aria-label="New category name"
        />
        <button type="submit" className="admin-primary-button" disabled={saving}>
          <Plus size={14} /> Add
        </button>
      </form>
      {error && <p className="admin-form-error">{error}</p>}

      {loading ? (
        <p>Loading categories…</p>
      ) : (
        <ul className="admin-category-list">
          {categories.map((category) => (
            <li key={category.id}>
              <span>{category.name}</span>
              <button aria-label={`Delete ${category.name}`} onClick={() => handleDelete(category.id, category.name)}>
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
