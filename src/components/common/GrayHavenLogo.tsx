// Gray Haven Bank — unique SVG logo mark + wordmark
interface GrayHavenLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function GrayHavenLogo({ size = 40, showWordmark = true, className = '' }: GrayHavenLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Logo mark: shield with anchor + wave motif */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Gray Haven Bank logo mark"
      >
        {/* Shield base */}
        <path
          d="M20 3L5 9v10c0 9.5 6.4 18.3 15 20.7C28.6 37.3 35 28.5 35 19V9L20 3z"
          fill="url(#ghb-shield-grad)"
        />
        {/* Inner shield highlight */}
        <path
          d="M20 6.5L8 11.5V19c0 7.8 5.2 15 12 17.3 6.8-2.3 12-9.5 12-17.3v-7.5L20 6.5z"
          fill="url(#ghb-inner-grad)"
          opacity="0.3"
        />
        {/* Anchor vertical bar */}
        <line x1="20" y1="13" x2="20" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        {/* Anchor cross bar */}
        <line x1="15" y1="16.5" x2="25" y2="16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        {/* Anchor circle top */}
        <circle cx="20" cy="13" r="2" fill="white"/>
        {/* Anchor curved arms */}
        <path
          d="M15 28 C15 31 17 32 20 32 C23 32 25 31 25 28"
          stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"
        />
        {/* Wave beneath anchor */}
        <path
          d="M13 24.5 C15 23 17 25.5 20 24.5 C23 23.5 25 25.5 27 24.5"
          stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"
        />
        <defs>
          <linearGradient id="ghb-shield-grad" x1="5" y1="3" x2="35" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#027976"/>
            <stop offset="100%" stopColor="#013d36"/>
          </linearGradient>
          <linearGradient id="ghb-inner-grad" x1="8" y1="6" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="100%" stopColor="#027976"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-black tracking-widest text-primary" style={{ fontSize: size * 0.35, letterSpacing: '0.12em' }}>
            GRAY HAVEN
          </span>
          <span className="font-semibold tracking-[0.3em] text-foreground" style={{ fontSize: size * 0.22 }}>
            BANK
          </span>
        </span>
      )}
    </span>
  );
}
