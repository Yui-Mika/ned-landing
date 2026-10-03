import { Fragment } from 'react';
import { motion, useTransform } from 'motion/react';
import { idea, milestones, problem, twoWays } from '../content/copy';
import { Anchored, Chapter, Fade, Words } from '../components/Reveal';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg } from '../motion/timeline';

/** 02 · The problem (120–380 vh, pinned). */
export function Problem() {
  return (
    <Chapter id="problem" label="The problem" stage={[120, 340]} out={[340, 356]} focusAt={336}>
      <div className="copy">
        <Words text={problem.headline} range={[130, 165]} className="headline" />
        <Fade range={[175, 195]} className="lede strong">
          {problem.lines[0]}
        </Fade>
        <Fade range={[250, 270]} className="lede strong">
          {problem.lines[1]}
        </Fade>
        <Fade range={[300, 322]} className="lede">
          {problem.lines[2]}
        </Fade>
      </div>
    </Chapter>
  );
}

/** 03 · The idea (380–700 vh): one brief first (03.5–03.9), then the money is sealed in the rack. */
export function Idea() {
  return (
    <Chapter id="idea" label="The idea" stage={[380, 650]} out={[650, 662]} focusAt={632}>
      <div className="copy">
        <Words text={idea.headline} range={[392, 425]} className="headline" />
        <Fade range={[440, 462]} className="lede strong">
          {idea.body}
        </Fade>
        <Fade range={[475, 500]} className="lede">
          {idea.brief}
        </Fade>
        <Fade range={[598, 612]} className="chip chip-ok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {idea.chip}
        </Fade>
        <Fade range={[615, 632]} className="lede">
          {idea.rule}
        </Fade>
      </div>
    </Chapter>
  );
}

/** 04 · Milestones (700–1200 vh, pinned): approved · released on its own · returned. */
export function Milestones() {
  return (
    <Chapter id="milestones" label="Milestones" stage={[700, 1150]} out={[1150, 1165]} focusAt={1120}>
      <div className="copy">
        <Fade range={[705, 720]} className="chip chip-build">
          {milestones.badge}
        </Fade>
        <Words text={milestones.headline} range={[710, 745]} className="headline" />
        <p className="lede strong steps">
          <Fade as="span" range={[760, 772]}>
            {milestones.steps[0]}
          </Fade>{' '}
          <Fade as="span" range={[790, 802]}>
            {milestones.steps[1]}
          </Fade>{' '}
          <Fade as="span" range={[830, 842]}>
            {milestones.steps[2]}
          </Fade>
        </p>
        <Fade range={[900, 920]} className="lede strong">
          {milestones.silence}
        </Fade>
        <Fade range={[1000, 1020]} className="lede">
          {milestones.deadline}
        </Fade>
        <Fade range={[1060, 1080]} className="lede">
          {milestones.deadline2}
        </Fade>
        <Fade range={[1100, 1120]} className="chip">
          {milestones.disputes}
        </Fade>
      </div>
    </Chapter>
  );
}

/** 05 · Two ways to receive (1200–1600 vh, pinned). Key moment at 1,462 vh. */
export function TwoWays() {
  const dimA = useTransform(vh, (v) => 1 - 0.5 * seg(v, [1375, 1390]));
  const dimOnce = useTransform(vh, (v) => 1 - 0.5 * seg(v, [1290, 1305]));
  return (
    <Chapter id="two-ways" label="Two ways to receive" stage={[1200, 1540]} out={[1540, 1555]} focusAt={1530}>
      <div className="copy">
        <Fade range={[1220, 1235]} className="chip chip-build">
          {twoWays.badge}
        </Fade>
        <Words text={twoWays.headline} range={[1210, 1245]} className="headline" />
        <motion.div style={{ opacity: dimOnce }}>
          <Fade range={[1248, 1270]} className="lede strong">
            {twoWays.once}
          </Fade>
        </motion.div>
        <motion.div style={{ opacity: dimA }}>
          <Fade range={[1298, 1318]} className="lede">
            {twoWays.abroad}
          </Fade>
        </motion.div>
        <Fade range={[1380, 1405]} className="lede strong">
          {twoWays.vietnam}
        </Fade>
        <Fade range={[1405, 1420]} className="chip chip-warn">
          {twoWays.partnerChip}
        </Fade>
        <Fade range={[1492, 1506]} className="vnd" as="div">
          <span className="vnd-amount">{twoWays.vnd}</span>
          <span className="vnd-note">{twoWays.vndNote}</span>
        </Fade>
        <Fade range={[1510, 1530]} className="small">
          {twoWays.identity}
        </Fade>
      </div>
    </Chapter>
  );
}

/** Page-layer elements pinned over the 3D scene. */
export function SceneLabels() {
  return (
    <>
      {/* Mailbox labels, hidden while the slot of light fills the screen (02.15–03.1). */}
      {([[128, 358], [398, 1150], [2490, 2700]] as const).map((r) => (
        <Fragment key={r[0]}>
          <Anchored name="tc" show={r} className="role-label" dy={30}>
            {problem.labels.client}
          </Anchored>
          <Anchored name="tf" show={r} className="role-label role-you" dy={30}>
            {problem.labels.you}
          </Anchored>
        </Fragment>
      ))}
      <Anchored name="gate1" show={[790, 838]} className="stamp" dy={-16}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
        {milestones.stamp}
      </Anchored>
      <Anchored name="slot1" show={[840, 1140]} className="scene-tag tag-ok" dy={22}>
        {milestones.outcomes.approved}
      </Anchored>
      <Anchored name="slot2" show={[955, 1140]} className="scene-tag tag-review" dy={48}>
        {milestones.outcomes.silent}
      </Anchored>
      <Anchored name="slot3" show={[1052, 1140]} className="scene-tag tag-warn" dy={22}>
        {milestones.outcomes.none}
      </Anchored>
      <Anchored name="wallet" show={[1340, 1372]} className="wallet-card" dy={-30}>
        <span className="mono wallet-name">{twoWays.wallet.name}</span>
        <span className="wallet-amount">{twoWays.wallet.amount}</span>
      </Anchored>
      <Anchored name="partner" show={[1400, 1540]} className="scene-tag" dy={30}>
        {twoWays.partnerLabel}
      </Anchored>
      <Anchored name="abroad" show={[1385, 1545]} className="side-tag">
        {twoWays.sides.abroad}
      </Anchored>
      <Anchored name="vietnam" show={[1385, 1545]} className="side-tag side-vn">
        {twoWays.sides.vietnam}
      </Anchored>
    </>
  );
}
