import { Check, Trash2 } from "lucide-react";
import { useAdminTestimonials } from "../../hooks/useAdminTestimonials";
import { approveTestimonial, deleteTestimonial } from "../../lib/adminApi";

export default function FeedbackManager() {
  const { testimonials, loading, refresh } = useAdminTestimonials();

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
      </div>

      {loading ? (
        <p>Loading feedback…</p>
      ) : testimonials.length === 0 ? (
        <p>No feedback yet. Approved feedback appears on the storefront automatically.</p>
      ) : (
        <ul className="admin-category-list">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="admin-feedback-row">
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
