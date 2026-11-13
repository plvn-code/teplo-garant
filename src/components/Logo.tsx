/**
 * TEPLOGARANT wordmark: the client's logo is the word in small caps with a vertical navy → red gradient.
 * On the dark site the navy end is lifted to a light ice-blue so it stays readable; the mark is a radiator whose
 * sections warm from blue to red — the same cold → warm idea.
 */
export function Mark({ size = 34, id = "lm" }: { size?: number; id?: string }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f9dff" />
          <stop offset=".55" stopColor="#c2365a" />
          <stop offset="1" stopColor="#ff2d33" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill={`url(#${id}-g)`} opacity=".16" />
      <rect x="1.5" y="1.5" width="37" height="37" rx="10.5" fill="none" stroke={`url(#${id}-g)`} strokeOpacity=".5" />
      {[9.5, 16.5, 23.5, 30.5].map((x, i) => (
        <rect key={x} className="logo-fin" x={x - 2.4} y={8 + (i % 2) * 1.5} width="4.8" height={24 - (i % 2) * 3} rx="2.4" fill={`url(#${id}-g)`} style={{ ["--i" as string]: i }} />
      ))}
    </svg>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="logo">
      <Mark size={size} />
      <span className="logo-word" aria-label="Teplogarant">
        <b>T</b>EPLO<b>G</b>ARANT
      </span>
    </span>
  );
}
