import { useState } from "react";
import { TEAMS } from "../kpi";

export default function Details({ who, onNext, note, tone }) {
  const [err, setErr] = useState("");
  const go = () => {
    if (!who.empNo || Number(who.empNo) < 1) return setErr("Enter your employee number.");
    if (!who.name.trim()) return setErr("Enter your name.");
    if (!who.team) return setErr("Choose your team.");
    setErr(""); onNext();
  };
  return (
    <>
      <label htmlFor="en">Employee number</label>
      <input id="en" inputMode="numeric" value={who.empNo} onChange={(e) => who.onEmp(e.target.value)} placeholder="e.g. 1" />
      <label htmlFor="nm">Name</label>
      <input id="nm" value={who.name} onChange={(e) => who.setName(e.target.value)} placeholder="Your name" autoComplete="off" />
      <label htmlFor="tm">Team</label>
      <select id="tm" value={who.team} onChange={(e) => who.setTeam(e.target.value)}>
        <option value="">Select your team…</option>
        {TEAMS.map((t) => <option key={t}>{t}</option>)}
      </select>
      <p className="err" key={err}>{err}</p>
      {note && <p className="warn">{note}</p>}
      <button className={`btn ${tone}`} onClick={go}>Next</button>
    </>
  );
}

