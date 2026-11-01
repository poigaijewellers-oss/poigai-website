import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAdminReels } from "../../hooks/useAdminReels";
import { createReel, deleteReel, toggleReelActive } from "../../lib/adminApi";

export default function ReelsManager() {
  const { reels, loading, refresh } = useAdminReels();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createReel({ instagram_url: url.trim(), caption: caption.trim(), sort_order: reels.length + 1 });
      setUrl("");
      setCaption("");
      await refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Couldn't add this reel.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    try {
      await toggleReelActive(id, !isActive);
      await refresh();
    } catch (toggleError) {
      window.alert(toggleError instanceof Error ? toggleError.message : "Couldn't update this reel.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this reel?")) return;
    try {
      await deleteReel(id);
      await refresh();
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Couldn't delete this reel.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Instagram Reels</h2>
      </div>

      <form className="admin-settings-form" onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <label>
          Instagram Reel URL
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            required
          />
        </label>
        <label>
          Caption (optional)
          <input value={caption} onChange={(event) => setCaption(event.target.value)} />
        </label>
        {error && <p className="admin-form-error">{error}</p>}
        <button type="submit" className="admin-primary-button" disabled={saving}>
          <Plus size={14} /> Add reel
        </button>
      </form>

      {loading ? (
        <p>Loading reels…</p>
      ) : reels.length === 0 ? (
        <p>No reels yet. Paste an Instagram Reel link above to show it on the storefront.</p>
      ) : (
        <ul className="admin-category-list">
          {reels.map((reel) => (
            <li key={reel.id}>
              <span>
                {reel.caption || reel.instagram_url}{" "}
                <span className={`admin-status ${reel.is_active ? "is-active" : "is-inactive"}`}>
                  {reel.is_active ? "Visible" : "Hidden"}
                </span>
              </span>
              <div className="admin-row-actions">
                <button onClick={() => handleToggle(reel.id, reel.is_active)} aria-label="Toggle visibility">
                  {reel.is_active ? "Hide" : "Show"}
                </button>
                <button aria-label="Delete reel" onClick={() => handleDelete(reel.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
