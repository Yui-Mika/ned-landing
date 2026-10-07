/**
 * Padlock glyph. TODO(asset): rebuild from the real N.E.D mark once it exists.
 * The shackle is drawn separately so chapter 05 can animate the stamp.
 */
export function LockGlyph({ size = 40, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M12 18v-5a8 8 0 0 1 16 0v5" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <rect x="7" y="17" width="26" height="20" rx="5" fill={color} />
      <text
        x="20"
        y="30.5"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontSize="7.5"
        fontWeight="700"
        fill="#fff"
      >
        N.E.D
      </text>
    </svg>
  );
}
