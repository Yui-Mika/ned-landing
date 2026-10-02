import { site } from '../content/hero';
import { DEMO_URL } from '../config';
import { ctaHoverProps } from '../components/ctaHover';

/** Temporary end of the prototype. Replaced by chapters 03–08. */
export function PrototypeEnd() {
  return (
    <section id="next" className="chapter chapter-end" aria-labelledby="next-title">
      <div className="end-copy">
        <p className="chip">Prototype · 2 Oct 2026</p>
        <h2 id="next-title" className="headline">{site.prototypeEnd.title}</h2>
        <p className="lede">{site.prototypeEnd.body}</p>
        <a id="demo" className="cta" href={DEMO_URL} target="_blank" rel="noopener" {...ctaHoverProps}>
          {site.demoLink} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
