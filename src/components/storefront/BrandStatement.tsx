import { Reveal } from "../common/Reveal";

// The brand line in its own language, given a full band of the page.
export function BrandStatement() {
  return (
    <section className="brand-statement" aria-label="POIGAI brand statement">
      <Reveal className="brand-statement-inner">
        <span className="brand-statement-ornament" aria-hidden="true">✦</span>
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
