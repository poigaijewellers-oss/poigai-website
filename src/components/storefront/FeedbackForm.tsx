import { useState } from "react";
import type { FormEvent } from "react";
import { Star } from "lucide-react";
import { submitTestimonial } from "../../lib/feedbackApi";
import { Reveal } from "../common/Reveal";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitTestimonial({ customer_name: name.trim(), message: message.trim(), rating });
      setSubmitted(true);
      setName("");
      setMessage("");
      setRating(5);
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
        <p className="eyebrow">உங்கள் கருத்தைப் பகிருங்கள்</p>
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
        {error && <p className="admin-form-error">{error}</p>}
        <button type="submit" className="primary-link" disabled={submitting}>
          {submitting ? "Sending…" : "Submit feedback"}
        </button>
      </form>
    </Reveal>
  );
}
