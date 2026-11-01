import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { updateSiteSettings } from "../../lib/adminApi";

export default function SettingsManager() {
  const { settings, loading, refresh } = useSiteSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSiteSettings(form);
      await refresh();
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading settings…</p>;

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Site settings</h2>
      </div>
      <form className="admin-settings-form" onSubmit={handleSubmit}>
        <label>
          Announcement bar text
          <input
            value={form.announcement_text}
            onChange={(event) => setForm({ ...form, announcement_text: event.target.value })}
          />
        </label>
        <label>
          WhatsApp number (country code + number, digits only)
          <input
            value={form.whatsapp_number}
            onChange={(event) => setForm({ ...form, whatsapp_number: event.target.value })}
          />
        </label>
        <label>
          Hero heading (use a line break for the second, emphasised line)
          <textarea
            rows={2}
            value={form.hero_heading}
            onChange={(event) => setForm({ ...form, hero_heading: event.target.value })}
          />
        </label>
        <label>
          Hero subheading
          <textarea
            rows={3}
            value={form.hero_subheading}
            onChange={(event) => setForm({ ...form, hero_subheading: event.target.value })}
          />
        </label>
        <label>
          Instagram URL
          <input
            value={form.instagram_url}
            onChange={(event) => setForm({ ...form, instagram_url: event.target.value })}
          />
        </label>

        <div className="admin-form-row">
          <label className="admin-color-field">
            Primary colour (headings, buttons)
            <div className="admin-color-row">
              <input
                type="color"
                value={form.theme_primary}
                onChange={(event) => setForm({ ...form, theme_primary: event.target.value })}
              />
              <span>{form.theme_primary}</span>
            </div>
          </label>
          <label className="admin-color-field">
            Accent colour (borders, highlights)
            <div className="admin-color-row">
              <input
                type="color"
                value={form.theme_accent}
                onChange={(event) => setForm({ ...form, theme_accent: event.target.value })}
              />
              <span>{form.theme_accent}</span>
            </div>
          </label>
        </div>

        {error && <p className="admin-form-error">{error}</p>}
        {saved && <p className="admin-form-success">Saved.</p>}
        <button type="submit" className="admin-primary-button" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </section>
  );
}
