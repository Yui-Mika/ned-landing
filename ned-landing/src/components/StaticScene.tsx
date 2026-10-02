// Shown when WebGL is unavailable: the hero's Fund and coins as a still picture.
export function StaticScene() {
  const orbit = [
    [815, 250], [765, 292], [645, 310], [525, 292], [475, 250], [525, 208], [765, 208],
  ];
  return (
    <div className="static-scene" aria-hidden="true">
      <svg viewBox="0 0 880 495" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sg" cx="73%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#5A1D9E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0D0618" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="880" height="495" fill="url(#sg)" />
        <ellipse cx="645" cy="250" rx="170" ry="60" fill="none" stroke="#9B4FDE" strokeOpacity="0.4" strokeDasharray="3 6" />
        <g transform="translate(645 250)">
          <rect x="-85" y="-95" width="170" height="190" rx="36" fill="#7B2FBE" fillOpacity="0.32" stroke="#B87AED" strokeWidth="1.5" />
          <rect x="-70" y="-80" width="140" height="160" rx="26" fill="#F0E4FF" fillOpacity="0.05" stroke="#F0E4FF" strokeOpacity="0.25" />
          <circle r="24" fill="none" stroke="#D4B5F7" strokeWidth="2" />
          <circle r="6" fill="#D4B5F7" />
        </g>
        {orbit.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="10" fill="#2775CA" stroke="#9CC3F2" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}
