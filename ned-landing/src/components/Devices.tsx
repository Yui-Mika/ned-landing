import type { ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { storyVh as vh } from '../motion/useScrollVh';
import { clamp, easeOut, seg, type Range } from '../motion/timeline';

// Chapter 06 (motion map v4.1): one wallet on two screens. A laptop runs the Workspace (brief, submit,
// review); the phone confirms (create, accept, lock, submit, release) and shows the VND arriving.
// Screens follow the NED Wallet design system v2.1 (light, white cards, one purple) and the demo path,
// with the landing page's wording rules (no "payout", no "vault"). Numbers: 250 USDC per milestone.

export const SCREEN_RANGES: Range[] = [
  [1640, 1710],
  [1710, 1780],
  [1780, 1850],
  [1850, 1920],
  [1920, 1990],
  [1990, 2030],
];

/** Which device leads each step. */
const LEAD: ('computer' | 'phone')[] = ['computer', 'phone', 'phone', 'computer', 'computer', 'phone'];
const WHO: ('client' | 'you')[] = ['client', 'you', 'client', 'you', 'client', 'you'];

function useStep(i: number, first = 1640) {
  const [a, b] = SCREEN_RANGES[i];
  return useTransform(vh, (v) => {
    const inn = i === 0 ? seg(v, [first, first + 14]) : seg(v, [a - 6, a + 6]);
    const out = i === SCREEN_RANGES.length - 1 ? 0 : seg(v, [b - 6, b + 6]);
    return inn * (1 - out);
  });
}

/** A screen that stays up across several steps (laptop: brief → stays until submit). */
function useSpan(a: number, b: number, edgeIn = true) {
  return useTransform(vh, (v) => (edgeIn ? seg(v, [a - 6, a + 6]) : 1) * (1 - seg(v, [b - 6, b + 6])));
}

const at = (r: Range) => useTransform(vh, (v) => seg(v, r));

function Slide({ p, label, done }: { p: MotionValue<number>; label: string; done?: string }) {
  const x = useTransform(p, (t) => `${easeOut(t) * 74}cqw`);
  const textO = useTransform(p, (t) => 1 - clamp(t * 2));
  const doneO = useTransform(p, (t) => seg(t, [0.85, 1]));
  return (
    <div className="dv-slide">
      <motion.span className="dv-slide-text" style={{ opacity: textO }}>
        {label}
      </motion.span>
      {done && (
        <motion.span className="dv-slide-done" style={{ opacity: doneO }}>
          {done}
        </motion.span>
      )}
      <motion.span className="dv-thumb" style={{ x }}>
        <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </motion.span>
    </div>
  );
}

const Chip = ({ tone = 'warn', children }: { tone?: 'warn' | 'ok' | 'lock' | 'neutral'; children: ReactNode }) => (
  <span className={`dv-chip dv-${tone}`}>{children}</span>
);

const Tick = ({ on }: { on: MotionValue<number> | number }) => (
  <motion.span className="dv-tick" style={{ opacity: typeof on === 'number' ? on : useTransform(on, (t) => 0.35 + 0.65 * t) }}>
    <svg width="70%" height="70%" viewBox="0 0 24 24" fill="none" stroke="#127A3A" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </motion.span>
);

// ---------------------------------------------------------------- laptop · Workspace

function WsBar() {
  return (
    <div className="ws-bar">
      <span className="ws-logo">N.E.D</span>
      <span className="ws-name">Workspace</span>
      <span className="ws-grow" />
      <Chip>Test network</Chip>
      <span className="ws-handle">@client</span>
    </div>
  );
}

function WsBrief() {
  const o = useSpan(1640, 1850, false);
  const rows = [at([1648, 1656]), at([1656, 1664]), at([1664, 1672]), at([1672, 1680])];
  const fp = at([1684, 1692]);
  const press = at([1694, 1700]);
  const scale = useTransform(press, (t) => 1 - 0.04 * Math.sin(t * Math.PI));
  return (
    <motion.div className="ws" style={{ opacity: o }}>
      <WsBar />
      <div className="ws-body">
        <div className="ws-main">
          <p className="ws-crumb">Workspace / New contract</p>
          <div className="ws-steps">
            <span className="on">1 · Brief</span>
            <span>2 · Freelancer accepts</span>
            <span>3 · Client locks</span>
            <span>4 · Work starts</span>
          </div>
          <div className="ws-card">
            <p className="ws-label">Title</p>
            <p className="ws-field">Logo and brand kit</p>
          </div>
          {[
            ['1', 'Logo concepts', 'Submit by 12 Oct · review 3 days', ['Three directions', 'Colours from the brand guide']],
            ['2', 'Brand kit', 'Submit by 26 Oct · review 3 days', ['Logo files in SVG and PNG', 'Usage guide, 6 pages']],
          ].map(([n, t, d, crit], k) => (
            <motion.div className="ws-card" key={n as string} style={{ opacity: rows[k * 2] }}>
              <div className="ws-row">
                <span className="ws-num">{n as string}</span>
                <div className="ws-grow">
                  <p className="ws-strong">{t as string}</p>
                  <p className="ws-small">{d as string}</p>
                </div>
                <p className="ws-amt">250 USDC</p>
              </div>
              <motion.div className="ws-done" style={{ opacity: rows[k * 2 + 1] }}>
                <p className="ws-label">Done when…</p>
                {(crit as string[]).map((c) => (
                  <p className="ws-crit" key={c}>
                    <span className="ws-box" /> {c}
                  </p>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="ws-side">
          <div className="ws-card">
            <p className="ws-label">Total to lock</p>
            <p className="ws-big">500 USDC</p>
            <p className="ws-small">2 milestones · locked after the freelancer accepts</p>
          </div>
          <motion.div className="ws-card" style={{ opacity: fp }}>
            <p className="ws-label">Brief fingerprint</p>
            <p className="ws-mono">9f3a…c21e</p>
            <p className="ws-small">Saved on-chain when you create. Neither side can change it.</p>
          </motion.div>
          <motion.p className="ws-btn" style={{ scale }}>
            Create contract
          </motion.p>
          <p className="ws-small">Opens your wallet to confirm. No money moves at this step.</p>
        </div>
      </div>
    </motion.div>
  );
}

function WsSubmit() {
  const o = useSpan(1850, 1920);
  const l1 = at([1856, 1864]);
  const l2 = at([1864, 1872]);
  const c = at([1872, 1886]);
  const done = at([1902, 1912]);
  return (
    <motion.div className="ws" style={{ opacity: o }}>
      <WsBar />
      <div className="ws-body">
        <div className="ws-main">
          <p className="ws-crumb">Workspace / Logo and brand kit / Milestone 1</p>
          <p className="ws-title">Submit milestone 1</p>
          <p className="ws-small">Logo concepts · submit by 12 Oct, 18:00 · 2 days left</p>
          <motion.div className="ws-card" style={{ opacity: l1 }}>
            <p className="ws-label">Links to your work</p>
            <div className="ws-row">
              <p className="ws-grow ws-strong">Figma · version 2214</p>
              <Chip tone="lock">Fixed version</Chip>
            </div>
          </motion.div>
          <motion.div className="ws-card" style={{ opacity: l2 }}>
            <p className="ws-label">Files · only their fingerprints are kept</p>
            <div className="ws-row">
              <p className="ws-grow ws-strong">logo-concepts.pdf</p>
              <p className="ws-mono">b81d…07f4</p>
            </div>
          </motion.div>
          <motion.div className="ws-card" style={{ opacity: c }}>
            <p className="ws-label">Check against the brief</p>
            <p className="ws-crit">
              <Tick on={1} /> Three directions
            </p>
            <p className="ws-crit">
              <Tick on={1} /> Colours from the brand guide
            </p>
          </motion.div>
        </div>
        <div className="ws-side">
          <div className="ws-card">
            <p className="ws-label">Comes to you after release</p>
            <p className="ws-big">≈ 6,500,000 VND</p>
            <p className="ws-small">example, estimated · to your bank via a licensed partner</p>
          </div>
          <div className="ws-card">
            <p className="ws-label">Delivery fingerprint</p>
            <p className="ws-mono">3f9a…c21e</p>
          </div>
          <p className="ws-btn">Submit milestone 1</p>
        </div>
      </div>
      <motion.div className="ws-overlay" style={{ opacity: done }}>
        <Chip tone="ok">Submitted · in review</Chip>
        <p className="ws-title">Recorded at 10 Oct 2026, 14:02</p>
        <p className="ws-small">Chain clock · on time · the client reviews in their Workspace</p>
      </motion.div>
    </motion.div>
  );
}

function WsReview() {
  const o = useSpan(1920, 2060);
  const same = at([1934, 1942]);
  const cd = useTransform(vh, (v) => {
    const left = 1 - seg(v, [1924, 1985]);
    const h = Math.round(58 * left);
    return `${Math.floor(h / 24)} d ${h % 24} h`;
  });
  const done = at([1976, 1986]);
  return (
    <motion.div className="ws" style={{ opacity: o }}>
      <WsBar />
      <div className="ws-body">
        <div className="ws-main">
          <p className="ws-crumb">Workspace / Logo and brand kit / Milestone 1</p>
          <p className="ws-title">Review milestone 1</p>
          <div className="ws-card ws-row">
            <div className="ws-grow">
              <p className="ws-label">Auto-release in</p>
              <motion.p className="ws-big">{cd}</motion.p>
            </div>
            <p className="ws-small">if you do nothing</p>
          </div>
          <div className="ws-card">
            <p className="ws-label">Delivery from the freelancer</p>
            <p className="ws-strong">Submitted 10 Oct, 14:02 · on time</p>
            <motion.div className="ws-match" style={{ opacity: same }}>
              <Tick on={1} /> Same delivery that was submitted
            </motion.div>
          </div>
          <div className="ws-card">
            <p className="ws-label">Done when…</p>
            <p className="ws-crit">
              <Tick on={same} /> Three directions
            </p>
            <p className="ws-crit">
              <Tick on={same} /> Colours from the brand guide
            </p>
          </div>
        </div>
        <div className="ws-side">
          <div className="ws-card">
            <p className="ws-label">Release for milestone 1</p>
            <p className="ws-big">250 USDC</p>
            <p className="ws-small">to a licensed partner, who sends VND to the freelancer (simulated)</p>
          </div>
          <p className="ws-btn">Release 250 USDC</p>
        </div>
      </div>
      <motion.div className="ws-overlay" style={{ opacity: done }}>
        <Chip tone="ok">Released</Chip>
        <p className="ws-title">Milestone 1 released</p>
        <p className="ws-small">Still locked: 250 USDC · milestone 2 due 26 Oct</p>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------- phone · wallet

function PhTop({ title }: { title: string }) {
  return (
    <div className="ph-top">
      <p className="ph-title">{title}</p>
      <Chip>Test</Chip>
    </div>
  );
}

function PhCreate() {
  const o = useStep(0);
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <PhTop title="Confirm" />
      <div className="ph-card">
        <p className="ph-label">Request from N.E.D Workspace</p>
        <p className="ph-strong">Create contract</p>
        <p className="ph-small">Logo and brand kit · locked later, after the freelancer accepts</p>
      </div>
      <div className="ph-card">
        <p className="ph-label">Brief fingerprint</p>
        <p className="ph-mono">9f3a…c21e</p>
        <p className="ph-small">Saved on-chain, cannot change</p>
      </div>
      <p className="ph-note">No money moves at this step.</p>
      <div className="ph-grow" />
      <Slide p={at([1696, 1706])} label="Slide to confirm" done="Created" />
    </motion.div>
  );
}

function PhAccept() {
  const o = useStep(1);
  const pick = at([1722, 1730]);
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <PhTop title="Accept contract" />
      <div className="ph-card">
        <p className="ph-strong">Logo and brand kit</p>
        <p className="ph-small">from @client · 2 milestones · 500 USDC</p>
      </div>
      <p className="ph-h">Where should your money go?</p>
      <motion.div className="ph-option" style={{ opacity: useTransform(pick, (t) => 0.5 + 0.5 * t) }}>
        <p className="ph-strong">
          VND to my Vietnamese bank account <Chip tone="neutral">Simulated</Chip>
        </p>
        <p className="ph-small">A licensed partner converts outside Vietnam and sends VND to your bank.</p>
      </motion.div>
      <p className="ph-small">You live in Vietnam, so your money arrives in VND only.</p>
      <div className="ph-warn">
        <b>This can't be changed later.</b> You never type an address.
      </div>
      <div className="ph-grow" />
      <Slide p={at([1758, 1770])} label="Slide to accept" done="Accepted" />
    </motion.div>
  );
}

function PhLock() {
  const o = useStep(2);
  const locked = at([1832, 1842]);
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <PhTop title="Lock for the freelancer" />
      <div className="ph-card">
        <p className="ph-label">Total to lock</p>
        <p className="ph-big">500.00 USDC</p>
        <p className="ph-small">Milestone 1 · 250 USDC · by 12 Oct</p>
        <p className="ph-small">Milestone 2 · 250 USDC · by 26 Oct</p>
      </div>
      <div className="ph-card">
        <p className="ph-small">Released when the client approves, or automatically after the review time.</p>
        <p className="ph-small">Refunded to the client if a submission deadline is missed.</p>
        <p className="ph-small">
          <b>Nobody, including N.E.D, can move it any other way.</b>
        </p>
      </div>
      <div className="ph-grow" />
      <Slide p={at([1812, 1826])} label="Slide to lock" done="Locked" />
      <motion.div className="ph-overlay" style={{ opacity: locked }}>
        <Chip tone="lock">Locked · work can start</Chip>
        <p className="ph-big">500.00 USDC</p>
        <p className="ph-small">Held by the program, not by N.E.D</p>
      </motion.div>
    </motion.div>
  );
}

function PhSubmit() {
  const o = useStep(3);
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <PhTop title="Confirm" />
      <div className="ph-card">
        <p className="ph-label">Request from N.E.D Workspace</p>
        <p className="ph-strong">Submit milestone 1</p>
        <p className="ph-small">On time · 2 days left</p>
      </div>
      <div className="ph-card">
        <p className="ph-label">Delivery fingerprint</p>
        <p className="ph-mono">3f9a…c21e</p>
        <p className="ph-small">Saved on-chain with the chain clock</p>
      </div>
      <p className="ph-note">After you submit, the client has 3 days to review. No answer: it is released to you.</p>
      <div className="ph-grow" />
      <Slide p={at([1890, 1902])} label="Slide to confirm" done="Submitted" />
    </motion.div>
  );
}

function PhRelease() {
  const o = useStep(4);
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <PhTop title="Confirm" />
      <div className="ph-card">
        <p className="ph-label">Request from N.E.D Workspace</p>
        <p className="ph-strong">Release milestone 1</p>
        <p className="ph-big">250 USDC</p>
      </div>
      <div className="ph-card">
        <p className="ph-label">Delivery fingerprint</p>
        <p className="ph-small">Matches what was submitted</p>
      </div>
      <p className="ph-note">Release cannot be undone. Check the delivery first.</p>
      <div className="ph-grow" />
      <Slide p={at([1962, 1974])} label="Slide to release" done="Released" />
    </motion.div>
  );
}

function PhArrived() {
  const o = useStep(5);
  const draw = at([1996, 2008]);
  const amount = at([2004, 2014]);
  const items = [
    ['Released by the contract', '10 Oct, 16:02'],
    ['Converted abroad by a licensed partner', '10 Oct, 16:05'],
    ['Sent to your bank account', '10 Oct, 16:09'],
  ];
  return (
    <motion.div className="ph" style={{ opacity: o }}>
      <div className="ph-received">
        <span className="ph-bigcheck">
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#127A3A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <motion.path d="M5 12l5 5 9-10" style={{ pathLength: draw }} />
          </svg>
        </span>
        <p className="ph-title">VND arrived</p>
        <motion.p className="ph-big ph-green" style={{ opacity: amount }}>
          ≈ 6,500,000 VND
        </motion.p>
        <motion.p className="ph-small" style={{ opacity: amount }}>
          example, estimated · milestone 1 of 2
        </motion.p>
      </div>
      <div className="ph-card">
        {items.map(([t, d]) => (
          <div className="ph-tl" key={t}>
            <Tick on={1} />
            <div>
              <p className="ph-strong">{t}</p>
              <p className="ph-mono">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="ph-small ph-center">Bank transfer simulated on the test network.</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------- the two devices

function WhoTag({ device }: { device: 'computer' | 'phone' }) {
  const label = useTransform(vh, (v) => {
    let i = SCREEN_RANGES.findIndex((r) => v < r[1]);
    if (i < 0) i = SCREEN_RANGES.length - 1;
    let j = i;
    if (device === 'computer') while (j > 0 && LEAD[j] !== 'computer') j--;
    return `${WHO[j] === 'client' ? "Client's" : 'Your'} ${device}`;
  });
  return <motion.p className="dv-who mono">{label}</motion.p>;
}

/** The sticky laptop + phone (06.4–06.13). Enter 1570–1600, leave 2030–2060. */
export function Devices() {
  const y = useTransform(vh, (v) => `${(1 - easeOut(seg(v, [1570, 1600]))) * 40}vh`);
  const scale = useTransform(vh, (v) => 1 - 0.4 * seg(v, [2030, 2060]));
  const opacity = useTransform(vh, (v) => clamp(seg(v, [1570, 1585])) * (1 - seg(v, [2030, 2060])));
  // The device that leads the current step is lit; the other steps back a little.
  const lit = (device: 'computer' | 'phone') =>
    useTransform(vh, (v) => {
      let best = 0;
      SCREEN_RANGES.forEach((r, i) => {
        if (LEAD[i] === device) best = Math.max(best, seg(v, [r[0] - 6, r[0] + 6]) * (1 - (i < 5 ? seg(v, [r[1] - 6, r[1] + 6]) : 0)));
      });
      return 0.55 + 0.45 * best;
    });
  const lapLit = lit('computer');
  const phLit = lit('phone');
  return (
    <motion.div className="devices" style={{ y, scale, opacity }} aria-hidden="true">
      <motion.div className="laptop" style={{ opacity: lapLit }}>
        <div className="laptop-screen">
          <WsBrief />
          <WsSubmit />
          <WsReview />
        </div>
        <div className="laptop-base" />
        <WhoTag device="computer" />
      </motion.div>
      <motion.div className="phone" style={{ opacity: phLit }}>
        <div className="phone-screen">
          <PhCreate />
          <PhAccept />
          <PhLock />
          <PhSubmit />
          <PhRelease />
          <PhArrived />
        </div>
        <WhoTag device="phone" />
      </motion.div>
    </motion.div>
  );
}
