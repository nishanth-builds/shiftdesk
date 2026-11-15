import { useEffect, useRef, useState } from "react";
import { firstName } from "../utils/format";
import { MOTIVATION } from "../constants";
import { useCount } from "../hooks/useCount";
import Split from "./Split";
import { KPI } from "../kpi";

function Stat({ label, n }) {
  const v = useCount(n);
  return <div className="stat"><b>{v}</b><span>{label}</span></div>;
}
function Result({ s }) {
  const rate = s.calls ? s.picked / s.calls : 0;
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);
  const pct = useCount(Math.round(rate * 100), 1300);
  return (
    <div className="result">
      <div className="ring">
        <svg viewBox="0 0 90 90" aria-hidden="true">
          <circle className="track" cx="45" cy="45" r="38" />
          <circle className="bar" cx="45" cy="45" r="38" style={{ strokeDashoffset: go ? 239 * (1 - rate) : 239 }} />
        </svg>
        <div><b>{pct}%</b><span>picked up</span></div>
      </div>
      <div className="stat-grid">
        <Stat label="Calls made" n={s.calls} />
        <Stat label="Picked up" n={s.picked} />
        <Stat label="Paid" n={s.paid} />
      </div>
    </div>
  );
}

export default function Done({ info, onHome }) {
  const login = info.kind === "login";
  const quote = useRef(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]).current;
  return (
    <section className="card thanks">
      <svg className="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg>
      <h1><Split text={`Thank you, ${firstName(info.name)}`} /></h1>
      <p className="sub">{login ? "Your login was recorded at " : "Your logout and KPI sheet were recorded at "}{info.time}.</p>
      <p className="quote">“{quote}”</p>
      {info.sales && <Result s={info.sales} />}
      {info.local && <p className="warn">Spreadsheet is not connected yet, so this was not sent.</p>}
      <p className="help">Any doubt? Contact Nishanth.</p>
      <button className="btn violet" onClick={onHome}>Done</button>
    </section>
  );
}
