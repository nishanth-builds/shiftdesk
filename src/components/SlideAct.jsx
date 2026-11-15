import { useRef, useState } from "react";

// Slide-to-confirm control: drag the knob to the end to trigger onDone.
const KNOB = 56; // knob size in px
const PAD = 4;   // gap between knob and track edge

export default function SlideAct({ label, onDone }) {
  const track = useRef(null);
  const start = useRef(0);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const max = () => (track.current ? track.current.clientWidth - KNOB - PAD * 2 : 0);

  const down = (e) => { start.current = e.clientX - x; setDrag(true); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (drag) setX(Math.max(0, Math.min(max(), e.clientX - start.current))); };
  const up = () => {
    setDrag(false);
    if (x >= max() * 0.88) { setX(max()); setTimeout(onDone, 150); } else setX(0);
  };

  return (
    <div className="slide" ref={track} style={{ "--p": max() ? x / max() : 0 }}>
      <div className="fill" style={{ width: x ? x + KNOB / 2 + PAD : 0 }} />
      <span className="lbl">{label}</span>
      <button
        className={"knob" + (drag ? " drag" : "")}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDone()}
        aria-label={label}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M5 6l6 6-6 6" /><path className="c2" d="M12 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
