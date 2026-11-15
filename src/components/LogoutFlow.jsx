import { Fragment, useState } from "react";
import { read, write } from "../utils/storage";
import { dateKey, fmt, today } from "../utils/format";
import { useWho } from "../hooks/useWho";
import Split from "./Split";
import Dots from "./Dots";
import Details from "./Details";
import PhotoBox from "./PhotoBox";
import { lastError, sendToSheet } from "../api";
import { KPI } from "../kpi";

export default function LogoutFlow({ onDone }) {
  const who = useWho();
  const [step, setStep] = useState(1);
  const [p1, setP1] = useState("");
  const [vals, setVals] = useState({});
  const [remarks, setRemarks] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const fields = KPI[who.team] || [];

  const next = () => {
    const prev = read("sd_logout_" + who.no, null);
    if (prev && prev.day === today()) return setNote("Already recorded: you submitted your logout report today. No duplicate was added.");
    setNote(""); setStep(2);
  };
  const toKpi = () => { if (!p1) return setErr("Add the photo to continue."); setErr(""); setStep(3); };

  const submit = async () => {
    for (const f of fields) {
      const v = vals[f.k] ?? "";
      if (f.type === "number" && (v === "" || !Number.isInteger(Number(v)) || Number(v) < 0)) return setErr(`Enter a whole number for "${f.label}" (use 0 if none).`);
      if ((f.type === "rating" || f.type === "yesno") && !v) return setErr(`Choose an answer for "${f.label}".`);
    }
    if (who.team === "Sales" && Number(vals.picked) > Number(vals.calls)) return setErr("Clients picked can't be higher than the number of client calls.");
    setBusy(true); setErr(""); setNote("");
    const t = new Date(), inRec = read("sd_login_" + who.no, null), same = inRec && inRec.day === today();
    let duration = "";
    if (same) { const m = Math.round((t - new Date(inRec.iso)) / 60000); duration = `${Math.floor(m / 60)}h ${m % 60}m`; }
    const r = await sendToSheet({
      type: "logout", shiftId: same ? inRec.shiftId : "L" + t.getTime(), empNo: who.no, name: who.name.trim(), team: who.team,
      dateKey: dateKey(t), loginTime: same ? fmt(inRec.iso) : "", logoutTime: fmt(t), duration,
      photoLaptop: p1, remarks: remarks.trim(),
      kpi: fields.map((f) => ({ label: f.label, value: vals[f.k] ?? "" })),
    });
    if (r === "failed") { setBusy(false); return setErr("Couldn't reach the spreadsheet. " + (lastError || "Check your connection and try again.")); }
    who.remember();
    write("sd_logout_" + who.no, { day: today() });
    if (r === "duplicate") { setBusy(false); return setNote("Already recorded: your logout report for today is already in the sheet. No duplicate was added."); }
    onDone({
      kind: "logout", name: who.name, time: fmt(t), local: r === "local",
      sales: who.team === "Sales" ? { calls: Number(vals.calls), picked: Number(vals.picked), paid: Number(vals.paid) } : null,
    });
  };

  return (
    <section className="card out">
      <h1><Split text="Logout" /></h1>
      <Dots step={step} total={3} />
      {step === 1 && <Details who={who} onNext={next} note={note} tone="pink" />}
      {step === 2 && (
        <>
          <PhotoBox label="Photo: laptop logout" hint="Show your laptop logged out or closed." value={p1} onChange={setP1} />
          <p className="err" key={err}>{err}</p>
          <button className="btn pink" onClick={toKpi}>Next: KPI sheet</button>
          <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
        </>
      )}
      {step === 3 && (
        <>
          <p className="sub">{who.team} KPI sheet</p>
          <div className="kpi">
            {fields.map((f, i) => (
              <Fragment key={f.k}>
                {f.s && <h2 className="kpi-sec">{f.s}</h2>}
                <div className={f.type === "long" ? "full" : ""}>
                  <label htmlFor={f.k}>{f.label}</label>
                  {f.type === "rating" ? (
                    <select id={f.k} value={vals[f.k] || ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })}>
                      <option value="">Rate 1 to 5…</option>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  ) : f.type === "yesno" ? (
                    <select id={f.k} value={vals[f.k] || ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })}>
                      <option value="">Select…</option>
                      <option>Yes</option><option>No</option>
                    </select>
                  ) : f.type === "long" ? (
                    <textarea id={f.k} rows="2" value={vals[f.k] ?? ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })} />
                  ) : (
                    <input id={f.k} type={f.type === "number" ? "number" : "text"} min="0" inputMode={f.type === "number" ? "numeric" : "text"}
                      value={vals[f.k] ?? ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })} />
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          <label htmlFor="rm">Remarks (optional)</label>
          <textarea id="rm" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <p className="err" key={err}>{err}</p>
          {note && <p className="warn">{note}</p>}
          <button className="btn pink" onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit and logout"}</button>
          <button className="btn ghost" onClick={() => setStep(2)}>Back</button>
        </>
      )}
    </section>
  );
}

