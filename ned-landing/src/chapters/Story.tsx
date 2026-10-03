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

/** 03 · The idea (380–640 vh). */
export function Idea() {
  return (
    <Chapter id="idea" label="The idea" stage={[380, 600]} out={[600, 612]} focusAt={580}>
      <div className="copy">
        <Words text={idea.headline} range={[392, 425]} className="headline" />
        <Fade range={[440, 462]} className="lede strong">
          {idea.body}
        </Fade>
        <Fade range={[540, 556]} className="chip chip-ok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {idea.chip}
        </Fade>
        <Fade range={[562, 580]} className="lede">
          {idea.rule}
        </Fade>
      </div>
    </Chapter>
  );
}

/** 04 · Milestones (640–1040 vh, pinned). */
export function Milestones() {
  return (
    <Chapter id="milestones" label="Milestones" stage={[640, 990]} out={[990, 1005]} focusAt={930}>
      <div className="copy">
        <Fade range={[645, 660]} className="chip chip-build">
          {milestones.badge}
        </Fade>
        <Words text={milestones.headline} range={[650, 685]} className="headline" />
        <p className="lede strong steps">
          <Fade as="span" range={[712, 724]}>
            {milestones.steps[0]}
          </Fade>{' '}
          <Fade as="span" range={[740, 752]}>
            {milestones.steps[1]}
          </Fade>{' '}
          <Fade as="span" range={[770, 782]}>
            {milestones.steps[2]}
          </Fade>
        </p>
        <Fade range={[845, 865]} className="lede">
          {milestones.deadline}
        </Fade>
        <Fade range={[910, 928]} className="lede">
          {milestones.deadline2}
        </Fade>
        <Fade range={[955, 975]} className="chip">
          {milestones.disputes}
        </Fade>
      </div>
    </Chapter>
  );
}

/** 05 · Two ways to receive (1040–1400 vh, pinned). Key moment at 1,262 vh. */
export function TwoWays() {
  const dimA = useTransform(vh, (v) => 1 - 0.5 * seg(v, [1175, 1190]));
  return (
    <Chapter id="two-ways" label="Two ways to receive" stage={[1040, 1340]} out={[1340, 1355]} focusAt={1330}>
      <div className="copy">
        <Fade range={[1060, 1075]} className="chip chip-build">
          {twoWays.badge}
        </Fade>
        <Words text={twoWays.headline} range={[1050, 1085]} className="headline" />
        <motion.div style={{ opacity: dimA }}>
          <Fade range={[1098, 1118]} className="lede">
            {twoWays.abroad}
          </Fade>
        </motion.div>
        <Fade range={[1180, 1205]} className="lede strong">
          {twoWays.vietnam}
        </Fade>
        <Fade range={[1205, 1220]} className="chip chip-warn">
          {twoWays.partnerChip}
        </Fade>
        <Fade range={[1292, 1306]} className="vnd" as="div">
          <span className="vnd-amount">{twoWays.vnd}</span>
          <span className="vnd-note">{twoWays.vndNote}</span>
        </Fade>
        <Fade range={[1310, 1330]} className="small">
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
      {/* Role labels, hidden while the slot of light fills the screen (02.16–03.1). */}
      {([[128, 358], [398, 990]] as const).map((r) => (
        <Fragment key={r[0]}>
          <Anchored name="tc" show={r} className="role-label" dy={34}>
            {problem.labels.client}
          </Anchored>
          <Anchored name="tf" show={r} className="role-label role-you" dy={34}>
            {problem.labels.you}
          </Anchored>
        </Fragment>
      ))}
      <Anchored name="gate1" show={[740, 800]} className="stamp" dy={-10}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
        {milestones.stamp}
      </Anchored>
      <Anchored name="wallet" show={[1140, 1172]} className="wallet-card" dy={-30}>
        <span className="mono wallet-name">{twoWays.wallet.name}</span>
        <span className="wallet-amount">{twoWays.wallet.amount}</span>
      </Anchored>
      <Anchored name="partner" show={[1200, 1340]} className="scene-tag" dy={-18}>
        {twoWays.partnerLabel}
      </Anchored>
      <Anchored name="abroad" show={[1185, 1345]} className="side-tag">
        {twoWays.sides.abroad}
      </Anchored>
      <Anchored name="vietnam" show={[1185, 1345]} className="side-tag side-vn">
        {twoWays.sides.vietnam}
      </Anchored>
    </>
  );
}
