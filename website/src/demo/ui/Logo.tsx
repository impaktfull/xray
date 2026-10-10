export function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 439) / 392} viewBox="0 0 392 439" aria-hidden="true">
      <path d="M196 263L0 149V218L196 332L392 218V149L196 263Z" fill="#7D64F2" />
      <path d="M196 370L0 256V325L196 439L392 325V256L196 370Z" fill="#fff" />
      <path d="M196 0L0 111L196 225L392 111L196 0Z" fill="#fff" />
    </svg>
  );
}
