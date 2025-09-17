export default function CalendarIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ display: "block" }}
    >
      <rect x="3" y="5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}