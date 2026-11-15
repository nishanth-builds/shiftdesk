import { useState } from "react";
import { useNow } from "../hooks/useNow";
import { MODES } from "../constants";
import SlideAct from "./SlideAct";

export default function Home({ onPick }) {
  const [mode, setMode] = useState("login");
  const now = useNow();
  const m = MODES[mode];

  return (
    <div className="home-grid">
      {/* Left: brand + headline (full-width layout on desktop) */}
      <section className="home-left">
        <div className="logo-big">
          <div className="hero">
            <p className="kicker">Daily shift command center</p>
            <h1 className="brand">SHIFT<em>DESK</em></h1>
            <h2 className="headline">Clock in.<br /><em>Report.</em><br />Improve.</h2>
          </div>
          <svg className="pulse" viewBox="0 0 530 45" aria-hidden="true">
            <defs>
              <linearGradient id="pg" gradientUnits="userSpaceOnUse" x1="0" x2="530" y1="0" y2="0">
                <stop offset="0" stopColor="#b30f1f" stopOpacity="0" /><stop offset=".25" stopColor="#e11d2e" /><stop offset=".75" stopColor="#c8102e" /><stop offset="1" stopColor="#ff2d3d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="pulse-base" d="M0 24H228L240 24L249 6L262 41L274 14L282 24H530" pathLength="1000" />
            <path className="pulse-run" d="M0 24H228L240 24L249 6L262 41L274 14L282 24H530" pathLength="1000" />
          </svg>
        </div>
      </section>

      {/* Right: action panel */}
      <section className="home-right">
        <div className="seg" role="tablist" aria-label="Choose action">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={mode === k} className={mode === k ? "on" : ""} onClick={() => setMode(k)}>{v.label}</button>
          ))}
        </div>
        <p className="nowline" key={"n" + mode}>
          {m.head} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
        <SlideAct key={mode} label={mode === "login" ? "Slide to clock in" : "Slide to clock out"} onDone={() => onPick(mode)} />
      </section>
    </div>
  );
}
