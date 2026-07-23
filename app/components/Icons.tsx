// Inline SVG icons for functional UI. Always render crisply on every
// device, unlike emoji, and inherit currentColor for theming.

type IconProps = { className?: string };

export function WhatsAppIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.27-1.38a9.87 9.87 0 0 0 4.72 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

export function GlobeIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function SearchIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ClockIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function EyeIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6A13.3 13.3 0 0 0 2 12s3.5 7 10 7a9.1 9.1 0 0 0 4.4-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function PinIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function StarIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="m12 2 2.9 6.26 6.85.8-5.07 4.67 1.36 6.77L12 17.1 5.96 20.5l1.36-6.77L2.25 9.06l6.85-.8L12 2Z" />
    </svg>
  );
}

// Scalloped "verified seal" — bright green badge with an offset darker-green
// shadow and a white check.
const SEAL_PATH =
  'M448.0 256.0 L447.2 260.6 L444.8 265.0 L441.1 269.2 L436.2 273.2 L430.5 276.9 L424.3 280.2 L418.0 283.2 L412.1 286.1 L406.9 288.8 L402.7 291.6 L399.7 294.5 L398.0 297.7 L397.7 301.3 L398.6 305.4 L400.7 310.0 L403.6 315.1 L407.0 320.7 L410.6 326.6 L414.0 332.8 L416.9 338.9 L418.9 344.9 L419.7 350.5 L419.3 355.5 L417.5 359.8 L414.4 363.2 L410.0 365.7 L404.5 367.2 L398.3 367.9 L391.5 367.9 L384.5 367.3 L377.6 366.5 L371.1 365.7 L365.2 365.2 L360.2 365.2 L356.1 366.1 L352.9 367.9 L350.7 370.7 L349.3 374.7 L348.6 379.6 L348.2 385.5 L348.1 392.1 L347.9 399.0 L347.4 406.0 L346.5 412.8 L344.9 418.9 L342.6 424.0 L339.6 428.0 L335.8 430.6 L331.3 431.8 L326.3 431.5 L320.8 429.9 L315.2 427.0 L309.5 423.4 L303.9 419.1 L298.5 414.7 L293.5 410.5 L288.8 406.9 L284.6 404.2 L280.7 402.7 L277.1 402.5 L273.7 403.7 L270.3 406.3 L267.0 410.1 L263.6 414.8 L259.9 420.3 L256.0 426.0 L251.8 431.6 L247.4 436.8 L242.8 441.1 L238.0 444.2 L233.3 445.9 L228.7 446.0 L224.3 444.6 L220.2 441.6 L216.6 437.3 L213.3 431.9 L210.5 425.7 L208.1 419.1 L206.0 412.5 L204.0 406.3 L202.0 400.7 L199.9 396.1 L197.4 392.7 L194.5 390.6 L191.0 389.8 L186.8 390.2 L182.0 391.6 L176.5 393.7 L170.5 396.3 L164.1 399.0 L157.5 401.5 L151.0 403.4 L144.8 404.5 L139.1 404.6 L134.2 403.5 L130.3 401.1 L127.4 397.5 L125.5 392.8 L124.8 387.2 L125.0 380.9 L126.0 374.2 L127.5 367.3 L129.3 360.6 L131.0 354.3 L132.4 348.6 L133.0 343.6 L132.8 339.4 L131.5 336.0 L129.0 333.4 L125.3 331.5 L120.4 330.0 L114.7 328.9 L108.2 327.8 L101.4 326.6 L94.5 325.2 L88.0 323.3 L82.1 320.8 L77.3 317.8 L73.8 314.2 L71.8 310.1 L71.3 305.5 L72.3 300.6 L74.7 295.4 L78.3 290.3 L82.7 285.1 L87.7 280.2 L92.9 275.5 L97.7 271.1 L101.9 267.0 L105.2 263.2 L107.3 259.5 L108.0 256.0 L107.3 252.5 L105.2 248.8 L101.9 245.0 L97.7 240.9 L92.9 236.5 L87.7 231.8 L82.7 226.9 L78.3 221.7 L74.7 216.6 L72.3 211.4 L71.3 206.5 L71.8 201.9 L73.8 197.8 L77.3 194.2 L82.1 191.2 L88.0 188.7 L94.5 186.8 L101.4 185.4 L108.2 184.2 L114.7 183.1 L120.4 182.0 L125.3 180.5 L129.0 178.6 L131.5 176.0 L132.8 172.6 L133.0 168.4 L132.4 163.4 L131.0 157.7 L129.3 151.4 L127.5 144.7 L126.0 137.8 L125.0 131.1 L124.8 124.8 L125.5 119.2 L127.4 114.5 L130.3 110.9 L134.2 108.5 L139.1 107.4 L144.8 107.5 L151.0 108.6 L157.5 110.5 L164.1 113.0 L170.5 115.7 L176.5 118.3 L182.0 120.4 L186.8 121.8 L191.0 122.2 L194.5 121.4 L197.4 119.3 L199.9 115.9 L202.0 111.3 L204.0 105.7 L206.0 99.5 L208.1 92.9 L210.5 86.3 L213.3 80.1 L216.6 74.7 L220.2 70.4 L224.3 67.4 L228.7 66.0 L233.3 66.1 L238.0 67.8 L242.8 70.9 L247.4 75.2 L251.8 80.4 L256.0 86.0 L259.9 91.7 L263.6 97.2 L267.0 101.9 L270.3 105.7 L273.7 108.3 L277.1 109.5 L280.7 109.3 L284.6 107.8 L288.8 105.1 L293.5 101.5 L298.5 97.3 L303.9 92.9 L309.5 88.6 L315.2 85.0 L320.8 82.1 L326.3 80.5 L331.3 80.2 L335.8 81.4 L339.6 84.0 L342.6 88.0 L344.9 93.1 L346.5 99.2 L347.4 106.0 L347.9 113.0 L348.1 119.9 L348.2 126.5 L348.6 132.4 L349.3 137.3 L350.7 141.3 L352.9 144.1 L356.1 145.9 L360.2 146.8 L365.2 146.8 L371.1 146.3 L377.6 145.5 L384.5 144.7 L391.5 144.1 L398.3 144.1 L404.5 144.8 L410.0 146.3 L414.4 148.8 L417.5 152.2 L419.3 156.5 L419.7 161.5 L418.9 167.1 L416.9 173.1 L414.0 179.2 L410.6 185.4 L407.0 191.3 L403.6 196.9 L400.7 202.0 L398.6 206.6 L397.7 210.7 L398.0 214.3 L399.7 217.5 L402.7 220.4 L406.9 223.2 L412.1 225.9 L418.0 228.8 L424.3 231.8 L430.5 235.1 L436.2 238.8 L441.1 242.8 L444.8 247.0 L447.2 251.4 L448.0 256.0 Z';

export function VerifiedIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <g transform="translate(0 12)">
        <path d={SEAL_PATH} fill="#12a150" />
      </g>
      <path d={SEAL_PATH} fill="#20c65b" />
      <path
        d="M182 262 L232 314 L340 196"
        fill="none"
        stroke="#fff"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
