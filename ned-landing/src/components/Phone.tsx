import { motion, useTransform, type MotionValue } from 'motion/react';
import { storyVh as vh } from '../motion/useScrollVh';
import { bell, clamp, easeOut, seg, type Range } from '../motion/timeline';

// Chapter 06: a phone with five screens of one milestone. Proposed designs (DesignKit) until real
// screenshots exist. No Teddy inside the screens: the 3D freelancer Teddy reacts beside the phone instead.

export const SCREEN_RANGES: Range[] = [
  [1440, 1520],
  [1520, 1600],
  [1600, 1680],
  [1680, 1760],
  [1760, 1830],
];

function useScreen(i: number) {
  const [a, b] = SCREEN_RANGES[i];
  const opacity = useTransform(vh, (v) => {
    const inn = i === 0 ? seg(v, [1440, 1456]) : seg(v, [a - 8, a + 8]);
    const out = i === SCREEN_RANGES.length - 1 ? 0 : seg(v, [b - 8, b + 8]);
    return inn * (1 - out);
  });
  const x = useTransform(vh, (v) => (1 - seg(v, i === 0 ? [1440, 1456] : [a - 8, a + 8])) * 24);
  return { opacity, x };
}

const Back = () => (
  <span className="ps-back" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  </span>
);

const Check = ({ draw }: { draw?: MotionValue<number> }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <motion.path d="M5 12l5 5 9-10" style={draw ? { pathLength: draw } : undefined} />
  </svg>
);

const useRow = (k: number) => useTransform(vh, (v) => seg(v, [1452 + k * 4, 1462 + k * 4]));

function ScreenContract() {
  const s = useScreen(0);
  const r1 = useRow(0);
  const r2 = useRow(1);
  const r3 = useRow(2);
  return (
    <motion.div className="ps" style={s}>
      <div className="ps-bar">
        <Back />
        <p className="ps-title">New contract</p>
        <p className="ps-step mono">1/2</p>
      </div>
      <p className="ps-label">Job</p>
      <div className="ps-field">Logo and brand kit</div>
      <p className="ps-muted">
        Client: <b className="ps-accent">@acme_studio</b>
      </p>
      <p className="ps-label">Milestones</p>
      <motion.div className="ps-row" style={{ opacity: r1 }}>
        <span className="ps-num mono">1</span>
        <div className="ps-grow">
          <p className="ps-strong">Logo concepts</p>
          <p className="ps-small">Submit by 12 Oct · review by 15 Oct</p>
        </div>
        <p className="mono ps-amt">$250</p>
      </motion.div>
      <motion.div className="ps-row" style={{ opacity: r2 }}>
        <span className="ps-num mono">2</span>
        <div className="ps-grow">
          <p className="ps-strong">Brand kit</p>
          <p className="ps-small">Submit by 26 Oct · review by 29 Oct</p>
        </div>
        <p className="mono ps-amt">$250</p>
      </motion.div>
      <motion.div className="ps-total" style={{ opacity: r3 }}>
        <span>Total</span>
        <b className="mono">$500.00 · 500 USDC</b>
      </motion.div>
      <div className="ps-spacer" />
      <div className="ps-btn">Send to client</div>
    </motion.div>
  );
}

function ScreenLock() {
  const s = useScreen(1);
  const ring = useTransform(vh, (v) => seg(v, [1545, 1580]));
  const locked = useTransform(vh, (v) => seg(v, [1580, 1586]));
  const btn = useTransform(locked, (l) => 1 - l);
  return (
    <motion.div className="ps" style={s}>
      <div className="ps-bar">
        <Back />
        <p className="ps-title">Lock the money</p>
        <span className="ps-tag mono">CLIENT</span>
      </div>
      <div className="ps-card">
        <span className="ps-avatar">LP</span>
        <div className="ps-grow">
          <p className="ps-strong">Logo and brand kit</p>
          <p className="ps-small">with @lan · 2 milestones</p>
        </div>
      </div>
      <div className="ps-hero">
        <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
          <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="66"
            cy="66"
            r="58"
            fill="none"
            stroke="#9B4FDE"
            strokeWidth="6"
            strokeLinecap="round"
            style={{ pathLength: ring, rotate: -90 }}
          />
        </svg>
        <div className="ps-hero-text">
          <p className="ps-small">You're locking</p>
          <p className="ps-big">$500.00</p>
          <p className="mono ps-small">500.00 USDC</p>
        </div>
      </div>
      <div className="ps-list">
        <div>
          <span>Logo concepts</span>
          <b className="mono">$250.00</b>
        </div>
        <div>
          <span>Brand kit</span>
          <b className="mono">$250.00</b>
        </div>
      </div>
      <div className="ps-spacer" />
      <div className="ps-btn-wrap">
        <motion.div className="ps-btn" style={{ opacity: btn }}>
          Lock 500 USDC
        </motion.div>
        <motion.div className="ps-done" style={{ opacity: locked }}>
          Locked · waiting for the first submission
        </motion.div>
      </div>
    </motion.div>
  );
}

function ScreenSubmit() {
  const s = useScreen(2);
  const attach = useTransform(vh, (v) => seg(v, [1615, 1630]));
  const attachX = useTransform(attach, (a) => (1 - a) * 20);
  const done = useTransform(vh, (v) => seg(v, [1650, 1656]));
  const btn = useTransform(done, (d) => 1 - d);
  return (
    <motion.div className="ps" style={s}>
      <div className="ps-bar">
        <Back />
        <p className="ps-title">Logo and brand kit</p>
        <span className="ps-gap" />
      </div>
      <div className="ps-locked">
        <p className="mono ps-lockline">LOCKED BY @ACME_STUDIO</p>
        <p className="ps-big2">≈ 12,900,000 VND</p>
        <p className="ps-small">example, estimated · the final amount depends on the rate at release</p>
      </div>
      <p className="ps-label">Milestone 1 of 2</p>
      <div className="ps-card col">
        <div className="ps-between">
          <p className="ps-strong">Logo concepts</p>
          <p className="mono ps-due">Due 12 Oct</p>
        </div>
        <motion.div className="ps-file" style={{ opacity: attach, x: attachX }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B87AED" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
          </svg>
          <div className="ps-grow">
            <p className="ps-strong">concepts-v2.pdf</p>
            <p className="ps-small">4.2 MB · ready to send</p>
          </div>
        </motion.div>
      </div>
      <div className="ps-spacer" />
      <div className="ps-btn-wrap">
        <motion.div className="ps-btn" style={{ opacity: btn }}>
          Submit milestone
        </motion.div>
        <motion.div className="ps-done" style={{ opacity: done }}>
          Submitted · 10 Oct, 14:20 · time recorded
        </motion.div>
      </div>
    </motion.div>
  );
}

function ScreenApprove() {
  const s = useScreen(3);
  const press = useTransform(vh, (v) => 1 - 0.03 * bell(seg(v, [1716, 1724])));
  const released = useTransform(vh, (v) => seg(v, [1728, 1734]));
  const btn = useTransform(released, (r) => 1 - r);
  return (
    <motion.div className="ps" style={s}>
      <div className="ps-bar">
        <Back />
        <p className="ps-title">Review milestone 1</p>
        <span className="ps-tag mono">CLIENT</span>
      </div>
      <div className="ps-card">
        <span className="ps-avatar">LP</span>
        <div className="ps-grow">
          <p className="ps-strong">@lan submitted Logo concepts</p>
          <p className="mono ps-small">10 Oct, 14:20 · on time</p>
        </div>
      </div>
      <div className="ps-tiles" aria-hidden="true">
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </div>
      <p className="ps-small">concepts-v2.pdf · "Three directions, as we discussed."</p>
      <div className="ps-spacer" />
      <div className="ps-btn-wrap">
        <motion.div className="ps-btn" style={{ opacity: btn, scale: press }}>
          Approve and release $250
        </motion.div>
        <motion.div className="ps-done" style={{ opacity: released }}>
          Released by the contract
        </motion.div>
      </div>
    </motion.div>
  );
}

function ScreenReceived() {
  const s = useScreen(4);
  const draw = useTransform(vh, (v) => easeOut(seg(v, [1770, 1790])));
  const amount = useTransform(vh, (v) => seg(v, [1780, 1795]));
  const items = [
    ['Released by the contract', '10 Oct, 16:02'],
    ['Converted abroad by a licensed partner', '10 Oct, 16:05'],
    ['Sent to your bank account', '10 Oct, 16:09'],
  ];
  return (
    <motion.div className="ps" style={s}>
      <div className="ps-received">
        <div className="ps-bigcheck">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <motion.path d="M5 12l5 5 9-10" style={{ pathLength: draw }} />
          </svg>
        </div>
        <p className="ps-title2">VND arrived</p>
        <motion.p className="ps-green" style={{ opacity: amount }}>
          ≈ 6,450,000 VND
        </motion.p>
        <motion.p className="ps-small" style={{ opacity: amount }}>
          example, estimated · Logo concepts, milestone 1 of 2
        </motion.p>
      </div>
      <div className="ps-card col">
        {items.map(([t, d]) => (
          <div className="ps-tl" key={t}>
            <span className="ps-tick">
              <Check />
            </span>
            <div>
              <p className="ps-strong small">{t}</p>
              <p className="mono ps-small">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="ps-small center">Bank transfer simulated on the test network.</p>
    </motion.div>
  );
}

/** The sticky phone (06.1–06.13). Enters from below at 1370–1400, leaves at 1830–1860. */
export function Phone() {
  const y = useTransform(vh, (v) => `${(1 - easeOut(seg(v, [1370, 1400]))) * 40}vh`);
  const scale = useTransform(vh, (v) => 1 - 0.4 * seg(v, [1830, 1860]));
  const opacity = useTransform(vh, (v) => clamp(seg(v, [1370, 1385])) * (1 - seg(v, [1830, 1860])));
  return (
    <motion.div className="phone" style={{ y, scale, opacity }} aria-hidden="true">
      <div className="phone-screen">
        <ScreenContract />
        <ScreenLock />
        <ScreenSubmit />
        <ScreenApprove />
        <ScreenReceived />
      </div>
    </motion.div>
  );
}
