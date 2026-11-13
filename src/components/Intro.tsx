import { Mark } from "./Logo";

/**
 * First-visit curtain: the radiator sections in the mark heat up one by one (cold blue → red glow),
 * the wordmark is wiped in, then the panel lifts. Pure CSS, so content never waits for JavaScript.
 * The layout script adds html.no-intro on repeat visits and inner pages.
 */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-heat" />
      <div className="intro-center">
        <span className="intro-mark">
          <Mark size={96} id="im" />
        </span>
        <p className="intro-word">
          <b>T</b>EPLO<b>G</b>ARANT
          <i className="intro-streak" />
        </p>
        <p className="intro-caption">гарантуємо тепло з 2000 року</p>
      </div>
    </div>
  );
}
