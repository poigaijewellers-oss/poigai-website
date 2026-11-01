import { Star } from "lucide-react";
import type { Testimonial } from "../../lib/types";
import { Reveal } from "../common/Reveal";

type TestimonialsProps = {
  testimonials: Testimonial[];
  loading: boolean;
};

export function Testimonials({ testimonials, loading }: TestimonialsProps) {
  return (
    <section className="testimonials-section" id="feedback">
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">வாடிக்கையாளர் கருத்துக்கள்</p>
          <h2>
            Loved by our <em>customers.</em>
          </h2>
        </div>
        <p className="section-aside">Real words, real sparkle.</p>
      </Reveal>

      {loading ? (
        <p className="product-grid-empty">Loading feedback…</p>
      ) : testimonials.length === 0 ? (
        <p className="product-grid-empty">Be the first to share how you feel about your POIGAI piece.</p>
      ) : (
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.id}>
              {testimonial.image_url && (
                <div className="testimonial-photo">
                  <img src={testimonial.image_url} alt="" />
                </div>
              )}
              <div className="testimonial-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill={index < testimonial.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p>&ldquo;{testimonial.message}&rdquo;</p>
              <strong>{testimonial.customer_name}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
