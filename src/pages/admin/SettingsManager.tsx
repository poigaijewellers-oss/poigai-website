import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { updateSiteSettings, uploadProductImage } from "../../lib/adminApi";
import { HOMEPAGE_SECTIONS } from "../../lib/types";

export default function SettingsManager() {
  const { settings, loading, refresh } = useSiteSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  async function handleHeroUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      setForm((current) => ({ ...current, hero_image_url: url }));
      setSaved(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  }

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
      const message = submitError instanceof Error ? submitError.message : "Couldn't save settings.";
      setError(
        message.includes("hero_image_url")
          ? "The hero photo needs a quick database update first: run supabase/migration_005_hero_image.sql in the Supabase SQL editor, then save again."
          : message.includes("hidden_sections")
            ? "Section switches need a quick database update first: run supabase/migration_006_section_toggles.sql in the Supabase SQL editor, then save again."
            : message,
      );
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
        <div className="admin-image-field">
          <span>Hero photo (landscape, about 1600 × 1200 px, jewellery in the centre)</span>
          <div className="admin-hero-preview">
            {form.hero_image_url ? (
              <img src={form.hero_image_url} alt="Current hero photo" />
            ) : (
              <em>Using the default photo</em>
            )}
          </div>
          <div className="admin-hero-actions">
            <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={uploading} />
            {form.hero_image_url && (
              <button type="button" className="admin-text-button" onClick={() => setForm({ ...form, hero_image_url: null })}>
                Use default photo
              </button>
            )}
          </div>
          {uploading && <span className="admin-upload-status">Uploading…</span>}
        </div>
        <label>
          Instagram URL
          <input
            value={form.instagram_url}
            onChange={(event) => setForm({ ...form, instagram_url: event.target.value })}
          />
        </label>

        <fieldset className="admin-sections">
          <legend>Homepage sections</legend>
          <p>Switch a section off to hide it from the website. The hero and the full collection always show.</p>
          {HOMEPAGE_SECTIONS.map((section) => {
            const hidden = form.hidden_sections ?? [];
            const isOn = !hidden.includes(section.key);
            return (
              <label key={section.key} className="admin-switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={isOn}
                  onChange={() =>
                    setForm({
                      ...form,
                      hidden_sections: isOn ? [...hidden, section.key] : hidden.filter((key) => key !== section.key),
                    })
                  }
                />
                <span className="admin-switch-track" aria-hidden="true" />
                <span className="admin-switch-label">{section.label}</span>
              </label>
            );
          })}
        </fieldset>

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
