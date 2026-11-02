import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { submitTestimonial, uploadFeedbackImage } from "../../lib/feedbackApi";
import { Reveal } from "../common/Reveal";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitTestimonial({ customer_name: name.trim(), message: message.trim(), rating, image_url: imageUrl });
      setSubmitted(true);
      setName("");
      setMessage("");
      setRating(5);
      setImageUrl(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Couldn't submit your feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Reveal className="feedback-form feedback-form-done">
        <p>Thank you! Your feedback is in — it will appear here once we review it. ✦</p>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <p className="eyebrow" lang="ta">உங்கள் கருத்தைப் பகிருங்கள்</p>
        <h3>Share your feedback</h3>
        <div className="feedback-stars" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const filled = value <= (hoverRating || rating);
            return (
              <button
                type="button"
                key={value}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                aria-pressed={value === rating}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              >
                <Star size={20} fill={filled ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
        <label>
          Your name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Your feedback
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} required />
        </label>

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
        <button type="submit" className="primary-link" disabled={submitting || uploading}>
          {submitting ? "Sending…" : "Submit feedback"}
        </button>
      </form>
    </Reveal>
  );
}
