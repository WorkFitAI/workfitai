/**
 * AuthPageIllustration — decorative elements for all auth pages
 * - Hot air balloon (absolute top-right, desktop only)
 * - City silhouette (absolute bottom-left, desktop only)
 */
export function AuthPageIllustration() {
  return (
    <>
      {/* Hot air balloon — top right */}
      <div className="pointer-events-none absolute right-16 top-24 hidden lg:block">
        <HotAirBalloonSvg />
      </div>
      {/* City silhouette — bottom left */}
      <div className="pointer-events-none absolute bottom-0 left-0 hidden lg:block">
        <CitySilhouetteSvg />
      </div>
    </>
  )
}

export function HotAirBalloonSvg() {
  return (
    <svg width="180" height="220" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Clouds */}
      <ellipse cx="20" cy="30" rx="18" ry="10" fill="#e8eaf6" opacity="0.8" />
      <ellipse cx="155" cy="55" rx="22" ry="12" fill="#e8eaf6" opacity="0.6" />
      <ellipse cx="140" cy="20" rx="14" ry="8" fill="#e8eaf6" opacity="0.5" />
      {/* Balloon body */}
      <ellipse cx="90" cy="90" rx="55" ry="70" fill="#8b9cf4" />
      {/* Balloon stripes */}
      <path d="M50 60 Q90 20 130 60" stroke="#6c7ee1" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M40 85 Q90 50 140 85" stroke="#6c7ee1" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M40 108 Q90 80 140 108" stroke="#6c7ee1" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Balloon highlight */}
      <ellipse cx="70" cy="65" rx="18" ry="25" fill="white" opacity="0.15" />
      {/* Ropes */}
      <line x1="70" y1="158" x2="68" y2="178" stroke="#8b9cf4" strokeWidth="1.5" />
      <line x1="90" y1="160" x2="90" y2="178" stroke="#8b9cf4" strokeWidth="1.5" />
      <line x1="110" y1="158" x2="112" y2="178" stroke="#8b9cf4" strokeWidth="1.5" />
      {/* Basket */}
      <rect x="62" y="178" width="56" height="28" rx="6" fill="#c5cae9" />
      <line x1="74" y1="178" x2="74" y2="206" stroke="#9fa8da" strokeWidth="1" />
      <line x1="90" y1="178" x2="90" y2="206" stroke="#9fa8da" strokeWidth="1" />
      <line x1="106" y1="178" x2="106" y2="206" stroke="#9fa8da" strokeWidth="1" />
      {/* People in basket (silhouettes) */}
      <circle cx="78" cy="173" r="5" fill="#7986cb" />
      <circle cx="90" cy="172" r="5" fill="#5c6bc0" />
      <circle cx="102" cy="173" r="5" fill="#7986cb" />
    </svg>
  )
}

export function CitySilhouetteSvg() {
  return (
    <svg width="420" height="120" viewBox="0 0 420 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Buildings */}
      <rect x="0" y="60" width="40" height="60" fill="#e8eaf0" />
      <rect x="5" y="80" width="6" height="6" fill="#c5cae9" />
      <rect x="15" y="80" width="6" height="6" fill="#c5cae9" />
      <rect x="25" y="80" width="6" height="6" fill="#c5cae9" />
      <rect x="5" y="95" width="6" height="6" fill="#c5cae9" />
      <rect x="25" y="95" width="6" height="6" fill="#c5cae9" />

      <rect x="35" y="40" width="50" height="80" fill="#dde0e8" />
      <rect x="40" y="50" width="8" height="8" fill="#c5cae9" />
      <rect x="56" y="50" width="8" height="8" fill="#c5cae9" />
      <rect x="72" y="50" width="8" height="8" fill="#c5cae9" />
      <rect x="40" y="66" width="8" height="8" fill="#c5cae9" />
      <rect x="56" y="66" width="8" height="8" fill="#c5cae9" />
      <rect x="72" y="66" width="8" height="8" fill="#c5cae9" />
      <rect x="40" y="82" width="8" height="8" fill="#c5cae9" />
      <rect x="56" y="82" width="8" height="8" fill="#c5cae9" />
      <rect x="72" y="82" width="8" height="8" fill="#c5cae9" />
      {/* Antenna */}
      <rect x="58" y="28" width="2" height="12" fill="#c5cae9" />
      <rect x="54" y="28" width="10" height="2" fill="#c5cae9" />

      <rect x="80" y="70" width="30" height="50" fill="#e8eaf0" />
      <rect x="85" y="78" width="6" height="6" fill="#c5cae9" />
      <rect x="98" y="78" width="6" height="6" fill="#c5cae9" />
      <rect x="85" y="92" width="6" height="6" fill="#c5cae9" />
      <rect x="98" y="92" width="6" height="6" fill="#c5cae9" />
      <rect x="85" y="106" width="6" height="6" fill="#c5cae9" />

      <rect x="105" y="50" width="45" height="70" fill="#dde0e8" />
      <rect x="112" y="60" width="8" height="8" fill="#aab0c8" />
      <rect x="126" y="60" width="8" height="8" fill="#aab0c8" />
      <rect x="140" y="60" width="8" height="8" fill="#aab0c8" />
      <rect x="112" y="76" width="8" height="8" fill="#aab0c8" />
      <rect x="126" y="76" width="8" height="8" fill="#aab0c8" />
      <rect x="140" y="76" width="8" height="8" fill="#aab0c8" />
      <rect x="112" y="92" width="8" height="8" fill="#aab0c8" />
      <rect x="126" y="92" width="8" height="8" fill="#aab0c8" />
      <rect x="112" y="108" width="8" height="8" fill="#aab0c8" />

      <rect x="145" y="75" width="25" height="45" fill="#e8eaf0" />
      <rect x="150" y="83" width="6" height="5" fill="#c5cae9" />
      <rect x="160" y="83" width="6" height="5" fill="#c5cae9" />
      <rect x="150" y="95" width="6" height="5" fill="#c5cae9" />
      <rect x="160" y="95" width="6" height="5" fill="#c5cae9" />

      {/* Stick people on ground */}
      {/* Person 1 */}
      <circle cx="188" cy="107" r="4" fill="#3d65f6" />
      <line x1="188" y1="111" x2="188" y2="120" stroke="#3d65f6" strokeWidth="2" />
      <line x1="183" y1="114" x2="193" y2="114" stroke="#3d65f6" strokeWidth="2" />
      <line x1="188" y1="120" x2="184" y2="128" stroke="#3d65f6" strokeWidth="2" />
      <line x1="188" y1="120" x2="192" y2="128" stroke="#3d65f6" strokeWidth="2" />
      {/* Person 2 */}
      <circle cx="208" cy="106" r="4" fill="#5c6bc0" />
      <line x1="208" y1="110" x2="208" y2="120" stroke="#5c6bc0" strokeWidth="2" />
      <line x1="203" y1="114" x2="213" y2="113" stroke="#5c6bc0" strokeWidth="2" />
      <line x1="208" y1="120" x2="204" y2="128" stroke="#5c6bc0" strokeWidth="2" />
      <line x1="208" y1="120" x2="212" y2="128" stroke="#5c6bc0" strokeWidth="2" />

      {/* Ground line */}
      <line x1="0" y1="130" x2="420" y2="130" stroke="#e8eaf0" strokeWidth="2" />
    </svg>
  )
}
