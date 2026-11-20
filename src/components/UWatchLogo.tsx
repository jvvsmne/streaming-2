interface UWatchLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 'h-7 w-7', text: 'text-xl' },
  md: { icon: 'h-8 w-8', text: 'text-2xl' },
  lg: { icon: 'h-10 w-10', text: 'text-3xl' },
};

export function UWatchLogo({ size = 'md', className = '' }: UWatchLogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dims.icon} shrink-0`}
        aria-hidden="true"
      >
        <rect x="2" y="2" width="60" height="60" rx="16" fill="#FF6B00" />
        <path
          d="M26.5 22.2C26.5 20.55 28.32 19.55 29.72 20.43L43.6 29.23C44.89 30.05 44.89 31.95 43.6 32.77L29.72 41.57C28.32 42.45 26.5 41.45 26.5 39.8V22.2Z"
          stroke="#111113"
          strokeWidth="4.75"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display ${dims.text} font-extrabold tracking-tight text-[#FF6B00] leading-none`}
      >
        UWatch
      </span>
    </span>
  );
}
