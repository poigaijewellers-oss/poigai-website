import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Check, ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import { useAdminTestimonials } from "../../hooks/useAdminTestimonials";
import { approveTestimonial, createTestimonialAdmin, deleteTestimonial } from "../../lib/adminApi";
import { uploadFeedbackImage } from "../../lib/feedbackApi";

export default function FeedbackManager() {
  const { testimonials, loading, refresh } = useAdminTestimonials();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFeedbackImage(file);
      setImageUrl(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Couldn't upload that photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createTestimonialAdmin({ customer_name: name.trim(), message: message.trim(), rating, image_url: imageUrl });
      setName("");
      setMessage("");
      setRating(5);
      setImageUrl(null);
      setShowForm(false);
      await refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Couldn't add this feedback.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await approveTestimonial(id);
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn't approve this feedback.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this feedback? This can't be undone.")) return;
    try {
      await deleteTestimonial(id);
      await refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn't delete this feedback.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Feedback</h2>
        <button className="admin-primary-button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={15} /> Add feedback
        </button>
      </div>

      {showForm && (
        <form className="admin-settings-form admin-feedback-form" onSubmit={handleCreate}>
          <label>
            Customer name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Message
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} required />
          </label>
          <div className="feedback-stars" role="radiogroup" aria-label="Rating">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  type="button"
                  key={value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  aria-pressed={value === rating}
                  onClick={() => setRating(value)}
                >
                  <Star size={18} fill={value <= rating ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>
          <div className="feedback-photo">
            {imageUrl ? (
              <div className="feedback-photo-preview">
                <img src={imageUrl} alt="" />
                <button type="button" onClick={() => setImageUrl(null)} aria-label="Remove photo">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="feedback-photo-upload">
                <ImagePlus size={15} />
                <span>{uploading ? "Uploading…" : "Add a photo (optional)"}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} hidden />
              </label>
            )}
          </div>
          {error && <p className="admin-form-error">{error}</p>}
          <button type="submit" className="admin-primary-button" disabled={saving || uploading}>
            {saving ? "Saving…" : "Save feedback"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading feedback…</p>
      ) : testimonials.length === 0 ? (
        <p>No feedback yet. Approved feedback appears on the storefront automatically.</p>
      ) : (
        <ul className="admin-category-list">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="admin-feedback-row">
              {testimonial.image_url && <img src={testimonial.image_url} alt="" className="admin-thumb" />}
              <div>
                <strong>{testimonial.customer_name}</strong> — {"★".repeat(testimonial.rating)}
                <p>{testimonial.message}</p>
                <span className={`admin-status ${testimonial.is_approved ? "is-active" : "is-inactive"}`}>
                  {testimonial.is_approved ? "Approved" : "Pending review"}
                </span>
              </div>
              <div className="admin-row-actions">
                {!testimonial.is_approved && (
                  <button aria-label="Approve feedback" onClick={() => handleApprove(testimonial.id)}>
                    <Check size={14} />
                  </button>
                )}
                <button aria-label="Delete feedback" onClick={() => handleDelete(testimonial.id)}>
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
