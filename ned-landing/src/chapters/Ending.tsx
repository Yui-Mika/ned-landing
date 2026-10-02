import { motion, useTransform } from 'motion/react';
import { app, close, real, role } from '../content/copy';
import { Chapter, Fade, Words } from '../components/Reveal';
import { MUSTACHE_PATH } from '../components/Mustache';
import { SCREEN_RANGES } from '../components/Phone';
import { ctaHoverProps } from '../components/ctaHover';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg, within } from '../motion/timeline';
import { DEMO_URL, GITHUB_URL, SCREENS_ARE_PROPOSED } from '../config';

function Step({ i }: { i: number }) {
  const step = app.steps[i];
  const r = SCREEN_RANGES[i];
  const on = useTransform(vh, (v) => 0.4 + 0.6 * within(v, [r[0] + 4, r[1] - 4], 8));
  const bar = useTransform(vh, (v) => seg(v, r));
  return (
    <motion.li className="step" style={{ opacity: on }}>
      <span className="step-num mono">{i + 1}</span>
      <div className="step-text">
        <p className="step-title">
          {step.title}
          {step.who && <span className="tag-client mono">{step.who}</span>}
        </p>
        <p className="step-sub">{step.sub}</p>
        <motion.span className="step-bar" style={{ scaleX: bar }} aria-hidden="true" />
      </div>
    </motion.li>
  );
}

/** 06 · The app (1400–1860 vh, sticky phone). The phone itself is a separate fixed layer. */
export function AppChapter() {
  const listIn = useTransform(vh, (v) => seg(v, [1436, 1450]));
  return (
    <Chapter id="app" label="The app" stage={[1400, 1830]} out={[1830, 1850]} focusAt={1800}>
      <div className="copy copy-app">
        <Words text={app.headline} range={[1405, 1435]} className="headline" />
        <Fade range={[1430, 1445]} className="small warn">
          {app.note}
        </Fade>
        <motion.ol className="steps-list" style={{ opacity: listIn }}>
          {app.steps.map((_, i) => (
            <Step key={i} i={i} />
          ))}
        </motion.ol>
        <Fade range={[1525, 1545]} className="small client-line">
          {app.client}
        </Fade>
        {SCREENS_ARE_PROPOSED && (
          <Fade range={[1440, 1455]} className="chip chip-dev">
            {app.proposed}
          </Fade>
        )}
      </div>
    </Chapter>
  );
}

/** 07 · What N.E.D does and doesn't do (1860–2080 vh, pinned). */
export function Role() {
  return (
    <Chapter id="role" label="What N.E.D does and doesn't do" stage={[1860, 2040]} out={[2040, 2055]} focusAt={2035} className="layer-center">
      <div className="role">
        <Words text={role.headline} range={[1868, 1900]} className="headline center" />
        <div className="role-cols">
          <div className="role-col">
            <Fade range={[1898, 1908]} className="k">
              {role.doesTitle}
            </Fade>
            <ul>
              {role.does.map((d, k) => (
                <Fade key={d.text} as="li" range={[1905 + k * 10, 1915 + k * 10]} x={-16} className="role-item">
                  <span className="dot" aria-hidden="true" />
                  <span>
                    {d.text}
                    {d.tag && <span className="tag mono">{d.tag}</span>}
                  </span>
                </Fade>
              ))}
            </ul>
          </div>
          <div className="role-col">
            <Fade range={[1943, 1952]} className="k">
              {role.doesntTitle}
            </Fade>
            <ul>
              {role.doesnt.map((d, k) => (
                <Cross key={d} text={d} r={[1950 + k * 10, 1960 + k * 10]} />
              ))}
            </ul>
          </div>
        </div>
        <div className="proof">
          {role.proof.map((p, k) => (
            <Fade key={p} range={[2005 + k * 6, 2013 + k * 6]} className="proof-item">
              {p}
            </Fade>
          ))}
          <Fade range={[2024, 2035]} className="proof-item mono">
            {role.code}{' '}
            <a href={GITHUB_URL} target="_blank" rel="noopener">
              {role.codeLink}
            </a>
          </Fade>
        </div>
      </div>
    </Chapter>
  );
}

function Cross({ text, r }: { text: string; r: [number, number] }) {
  const draw = useTransform(vh, (v) => seg(v, [r[0], r[0] + 5]));
  const textIn = useTransform(vh, (v) => seg(v, [r[0] + 3, r[1]]));
  return (
    <li className="role-item not">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
        <motion.path d="M6 6l12 12" style={{ pathLength: draw }} />
        <motion.path d="M18 6L6 18" style={{ pathLength: draw }} />
      </svg>
      <span className="sr-only">Doesn't: </span>
      <motion.span style={{ opacity: textIn }}>{text}</motion.span>
    </li>
  );
}

/** 08 · What's real today (2080–2260 vh). */
export function Real() {
  return (
    <Chapter id="real" label="What's real today" stage={[2080, 2222]} out={[2222, 2236]} focusAt={2220} className="layer-center">
      <div className="real">
        <Words text={real.headline} range={[2085, 2115]} className="headline center" />
        <Fade range={[2110, 2122]} className="small center">
          {real.note}
        </Fade>
        <ol className="timeline">
          {real.nodes.map((n, k) => (
            <Fade key={n.title} as="li" range={[2120 + k * 12, 2132 + k * 12]} className={`node${k === 0 ? ' now' : ''}`}>
              <span className="node-dot" aria-hidden="true" />
              <span className="node-when mono">{n.when}</span>
              <span className="node-title">{n.title}</span>
              <span className="node-text">{n.text}</span>
            </Fade>
          ))}
        </ol>
        <div className="not-yet">
          <Fade range={[2170, 2178]} className="k">
            {real.notYetTitle}
          </Fade>
          <ul>
            {real.notYet.map((t, k) => (
              <Fade key={t} as="li" range={[2175 + k * 7, 2182 + k * 7]}>
                <span aria-hidden="true">–</span> {t}
              </Fade>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}

/** 09 · Close (2260–2480 vh). */
export function Close() {
  const sign = useTransform(vh, (v) => seg(v, [2440, 2480]));
  return (
    <Chapter id="close" label="Try the demo" stage={[2300, 2600]} out={[9000, 9001]} focusAt={2368}>
      <div className="copy">
        <Words text={close.headline} range={[2320, 2350]} className="display" />
        <Fade range={[2345, 2360]} className="lede">
          {close.sub}
        </Fade>
        <Fade range={[2355, 2368]} as="div" className="cta-row">
          <a id="demo" className="cta" href={DEMO_URL} target="_blank" rel="noopener" {...ctaHoverProps}>
            {close.cta} <span aria-hidden="true">↗</span>
          </a>
        </Fade>
        <Fade range={[2370, 2385]} className="small client-line">
          {close.client}
        </Fade>
        <Fade range={[2385, 2395]} className="chip">
          {close.waitlist}
        </Fade>
      </div>
      <footer className="footer">
        <svg className="footer-glyph" viewBox="-130 -24 260 64" aria-hidden="true">
          <motion.path d={MUSTACHE_PATH} fill="none" stroke="var(--glyph)" strokeWidth={4} strokeLinecap="round" style={{ pathLength: sign }} />
        </svg>
        <Fade range={[2440, 2460]} as="div" className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noopener">
            {close.footer.github}
          </a>
          <span aria-hidden="true">·</span>
          <a href={DEMO_URL} target="_blank" rel="noopener">
            {close.footer.demo}
          </a>
        </Fade>
      </footer>
    </Chapter>
  );
}

