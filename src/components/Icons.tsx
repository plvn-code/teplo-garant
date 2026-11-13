const paths = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  phone: "M6.6 3.5 9.3 4l1.2 4-2 1.6a13 13 0 0 0 5.9 5.9l1.6-2 4 1.2.5 2.7a2 2 0 0 1-2 2.1A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2.1-2Z",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "m5 12.5 4.5 4.5L19 7.5",
  chevron: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  truck: "M3 6.5h11v9H3zM14 9.5h3.6l3 3v3H14M7 18.5a1.8 1.8 0 1 0 0-.1M17.5 18.5a1.8 1.8 0 1 0 0-.1",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4",
  bag: "M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  filter: "M4 6h16M7 12h10M10 18h4",
  trash: "M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13",
  shield: "M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6zM9 12l2 2 4-4",
  drop: "M12 3.5S6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7s-1.5-4-4-4a2 2 0 0 0 0 4M12 7s1.5-4 4-4a2 2 0 0 1 0 4",
  snow: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5",
  chat: "M4 5h16v11H9l-5 4z",
  star: "m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
  box: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  flask: "M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10",
  flame: "M12 21c-3.6 0-6-2.4-6-5.6 0-3.4 2.6-5 3.4-8.4 2 1.4 2.6 3.4 2.6 4.6 1-.8 1.6-2.2 1.6-3.6 2.5 1.8 4.4 4.4 4.4 7.4 0 3.2-2.4 5.6-6 5.6Z",
  radiator: "M5 5v14M9.5 5v14M14 5v14M18.5 5v14M3 8h18M3 16h18",
  thermo: "M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0ZM12 9v8",
  ruler: "M3 15 15 3l6 6L9 21zM7 11l2 2M10 8l2 2M13 5l2 2",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  cube: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9",
  play: "M8 5.5v13l11-6.5z",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8.5h.01",
  palette: "M12 21a9 9 0 1 1 9-9c0 2-1.6 3-3.5 3H16a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 21ZM7.5 11h.01M10 7h.01M15 7.5h.01",
  wrench: "M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2ZM6 4l3 3-2 2-3-3",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className, stroke = 1.6 }: { name: IconName; size?: number; className?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}

export function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  const d: Record<string, string> = {
    Instagram: "M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5-9.5h.01",
    Telegram: "m21 4-3 16-6.5-5.5L18 8l-8.5 5.5L3.5 11.5z",
    TikTok: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.8 2.3 4.5 5 4.8",
    Facebook: "M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z",
    Viber: "M12 3c5 0 8.5 2.3 8.5 7.8S17 18.5 12 18.5c-.8 0-1.6 0-2.4-.2L6 21v-3.6C4 16 3.5 13.6 3.5 10.8 3.5 5.3 7 3 12 3Zm-2.5 4.5c-.6 0-1 .6-.8 1.4.6 2.4 2.6 4.6 5 5.4.8.3 1.5-.2 1.6-.9l.1-.6-1.8-1-.8.7c-1-.4-1.8-1.3-2.2-2.3l.7-.8-.9-1.8Z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d[name] ?? ""} />
    </svg>
  );
}
