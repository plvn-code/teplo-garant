/**
 * "Made by superio" credit — the studio that built the site.
 * Same mark as on the other client sites. Monochrome here; the Superio orange shows only on hover/focus.
 */
export function MadeBy() {
  return (
    <span className="made-by" tabIndex={0} aria-label="Сайт створено агенцією Superio">
      <span className="made-by-label" aria-hidden="true">
        Made by
      </span>
      <svg className="made-by-mark" viewBox="262 196 730 830" width="20" height="23" aria-hidden="true">
        <path className="made-by-hex" d="M627 238L950 415V795L627 975L304 795V415Z" fill="none" strokeWidth="56" strokeLinejoin="round" />
        <path
          fill="currentColor"
          d="M412 486Q412 478 420 474L598 384Q612 377 626 384L722 433V524Q722 530 716 527L608 473L510 525L823 635Q843 643 843 665V725Q843 742 828 750L640 846Q628 852 616 846L430 750Q414 742 414 725V662Q414 652 423 656L628 760L752 695L433 585Q412 577 412 555Z"
        />
        <rect className="made-by-dot" x="757" y="451" width="64" height="65" />
      </svg>
      <span className="made-by-word" aria-hidden="true">
        superıo
      </span>
    </span>
  );
}
