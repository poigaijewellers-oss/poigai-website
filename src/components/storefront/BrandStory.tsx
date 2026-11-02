import { Reveal } from "../common/Reveal";

export function BrandStory() {
  return (
    <section className="brand-story" id="story">
      <Reveal>
        <div className="story-mark">
          <img src="/poigai-logo-mark-256.png" alt="" />
        </div>
        <p className="eyebrow">A NOTE FROM POIGAI</p>
        <h2>
          Not just for occasions.
          <br />
          <em>For every version of you.</em>
        </h2>
        <p>
          Some pieces become part of your everyday story. POIGAI is about finding
          those little details that make you feel a little more like yourself.
        </p>
        <span className="story-tamil">அழகு மலரும் இடம்.</span>
      </Reveal>
    </section>
  );
}
