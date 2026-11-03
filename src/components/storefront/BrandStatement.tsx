import { Reveal } from "../common/Reveal";

// The brand line in its own language, given a full band of the page.
export function BrandStatement() {
  return (
    <section className="brand-statement" aria-label="POIGAI brand statement">
      <Reveal className="brand-statement-inner">
        {/* A lotus: பொய்கை is a pond, where the lotus blooms */}
        <svg className="brand-statement-ornament" viewBox="0 0 46 28" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
            <path d="M23 3 C27 9 27 17 23 23 C19 17 19 9 23 3 Z" />
            <path d="M23 23 C17 21 12 15 12 8 C17 10 21 15 23 23 Z" />
            <path d="M23 23 C29 21 34 15 34 8 C29 10 25 15 23 23 Z" />
            <path d="M23 23 C15 24 7 21 3 15 C10 14 17 17 23 23 Z" />
            <path d="M23 23 C31 24 39 21 43 15 C36 14 29 17 23 23 Z" />
            <path d="M9 26 H37" strokeLinecap="round" />
          </g>
        </svg>
        <p className="brand-statement-tamil" lang="ta">
          <strong>பொய்கை</strong>
          <span className="brand-statement-dash" aria-hidden="true">—</span>
          <span>அழகு மலரும் இடம்.</span>
        </p>
        <p className="brand-statement-english">Poigai · a pond where beauty blossoms</p>
      </Reveal>
    </section>
  );
}
