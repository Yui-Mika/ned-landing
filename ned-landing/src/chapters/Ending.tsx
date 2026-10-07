import { motion, useTransform } from 'motion/react';
import { app, close, real, role } from '../content/copy';
import { Chapter, Fade, Words } from '../components/Reveal';
import { MUSTACHE_PATH } from '../components/Mustache';
import { SCREEN_RANGES } from '../components/Devices';
import { ctaHoverProps } from '../components/ctaHover';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg, within } from '../motion/timeline';
import { DEMO_URL, GITHUB_URL, SCREENS_ARE_PROPOSED } from '../config';

function Step({ i }: { i: number }) {
  const step = app.steps[i];
  const r = SCREEN_RANGES[i];
  const on = useTransform(vh, (v) => 0.4 + 0.6 * within(v, [r[0] + 4, r[1] - 4], 8));
  const bar = useTransform(vh, (v) => seg(v, r));
  const stamp = useTransform(vh, (v) => seg(v, [r[1] - 4, r[1]]));
  const stampScale = useTransform(stamp, (s) => (s <= 0 ? 0.6 : 1.15 - 0.15 * s));
  return (
    <motion.li className="step" style={{ opacity: on }}>
      <span className="step-num mono">{i + 1}</span>
      <div className="step-text">
        <p className="step-title">
          {step.title}
          {step.who && <span className="tag-client mono">{step.who}</span>}
          <span className="tag-where mono">{step.where}</span>
        </p>
        <p className="step-sub">{step.sub}</p>
        <motion.span className="step-bar" style={{ scaleX: bar }} aria-hidden="true" />
      </div>
      <motion.span className="step-stamp" style={{ opacity: stamp, scale: stampScale }} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M7.5 12.5l3 3 6-6.5" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </motion.span>
    </motion.li>
  );
}

/** 06 · Phone and computer (1600–2060 vh, sticky devices). The devices are a separate fixed layer. */
export function AppChapter() {
  const listIn = useTransform(vh, (v) => seg(v, [1636, 1650]));
  return (
    <Chapter id="app" label="Phone and computer" stage={[1600, 2030]} out={[2030, 2050]} focusAt={2020}>
      <div className="copy copy-app">
        <Words text={app.headline} range={[1605, 1635]} className="headline" />
        <Fade range={[1630, 1645]} className="small warn">
          {app.note}
        </Fade>
        <motion.ol className="steps-list" style={{ opacity: listIn }}>
          {app.steps.map((_, i) => (
            <Step key={i} i={i} />
          ))}
        </motion.ol>
        <Fade range={[1785, 1805]} className="small client-line">
          {app.client}
        </Fade>
        {SCREENS_ARE_PROPOSED && (
          <Fade range={[1640, 1655]} className="chip chip-dev">
            {app.proposed}
          </Fade>
        )}
      </div>
    </Chapter>
  );
}

/** 07 · What N.E.D does and doesn't do (2260–2280 vh, pinned). */
export function Role() {
  return (
    <Chapter id="role" label="What N.E.D does and doesn't do" stage={[2060, 2240]} out={[2240, 2255]} focusAt={2235} className="layer-center">
      <div className="role">
        <Words text={role.headline} range={[2068, 2100]} className="headline center" />
        <Fade range={[2098, 2108]} className="small center">
          {role.nobody}
        </Fade>
        <div className="role-cols">
          <div className="role-col">
            <Fade range={[2098, 2108]} className="k">
              {role.doesTitle}
            </Fade>
            <ul>
              {role.does.map((d, k) => (
                <Fade key={d.text} as="li" range={[2105 + k * 10, 2115 + k * 10]} x={-16} className="role-item">
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
            <Fade range={[2143, 2152]} className="k">
              {role.doesntTitle}
            </Fade>
            <ul>
              {role.doesnt.map((d, k) => (
                <Cross key={d} text={d} r={[2150 + k * 10, 2160 + k * 10]} />
              ))}
            </ul>
          </div>
        </div>
        <div className="proof">
          {role.proof.map((p, k) => (
            <Fade key={p} range={[2205 + k * 5, 2212 + k * 5]} className="proof-item">
              {p}
            </Fade>
          ))}
          <Fade range={[2226, 2235]} className="proof-item mono">
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

/** 08 · What's real today (2480–2460 vh). */
export function Real() {
  return (
    <Chapter id="real" label="What's real today" stage={[2280, 2422]} out={[2422, 2436]} focusAt={2420} className="layer-center">
      <div className="real">
        <Words text={real.headline} range={[2285, 2315]} className="headline center" />
        <Fade range={[2310, 2322]} className="small center">
          {real.note}
        </Fade>
        <ol className="timeline">
          {real.nodes.map((n, k) => (
            <Fade key={n.title} as="li" range={[2320 + k * 12, 2332 + k * 12]} className={`node${k === 0 ? ' now' : ''}`}>
              <span className="node-dot" aria-hidden="true" />
              <span className="node-when mono">{n.when}</span>
              <span className="node-title">{n.title}</span>
              <span className="node-text">{n.text}</span>
            </Fade>
          ))}
        </ol>
        <Fade as="div" range={[2364, 2372]} className="not-yet">
          <Fade range={[2370, 2378]} className="k">
            {real.notYetTitle}
          </Fade>
          <ul>
            {real.notYet.map((t, k) => (
              <Fade key={t} as="li" range={[2372 + k * 6, 2379 + k * 6]}>
                <span aria-hidden="true">–</span> {t}
              </Fade>
            ))}
          </ul>
        </Fade>
      </div>
    </Chapter>
  );
}

/** 09 · Close (2660–2880 vh). */
export function Close() {
  const sign = useTransform(vh, (v) => seg(v, [2640, 2680]));
  return (
    <Chapter id="close" label="Try the demo" stage={[2500, 2800]} out={[9000, 9001]} focusAt={2568}>
      <div className="copy">
        <Words text={close.headline} range={[2520, 2550]} className="display" />
        <Fade range={[2545, 2560]} className="lede">
          {close.sub}
        </Fade>
        <Fade range={[2555, 2568]} as="div" className="cta-row">
          <a id="demo" className="cta" href={DEMO_URL} target="_blank" rel="noopener" {...ctaHoverProps}>
            {close.cta} <span aria-hidden="true">↗</span>
          </a>
        </Fade>
        <Fade range={[2570, 2585]} className="small client-line">
          {close.client}
        </Fade>
        <Fade range={[2585, 2595]} className="chip">
          {close.waitlist}
        </Fade>
      </div>
      <footer className="footer">
        <svg className="footer-glyph" viewBox="-130 -24 260 64" aria-hidden="true">
          <motion.path d={MUSTACHE_PATH} fill="none" stroke="var(--glyph)" strokeWidth={4} strokeLinecap="round" style={{ pathLength: sign }} />
        </svg>
        <Fade range={[2640, 2660]} as="div" className="footer-links">
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

