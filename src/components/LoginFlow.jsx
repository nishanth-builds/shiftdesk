import { useState } from "react";
import { read, write } from "../utils/storage";
import { dateKey, fmt, today } from "../utils/format";
import { useNow } from "../hooks/useNow";
import { useWho } from "../hooks/useWho";
import Split from "./Split";
import Dots from "./Dots";
import Details from "./Details";
import PhotoBox from "./PhotoBox";
import { lastError, sendToSheet } from "../api";

export default function LoginFlow({ onDone }) {
  const who = useWho();
  const now = useNow();
  const [step, setStep] = useState(1);
  const [p1, setP1] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const next = () => {
    const prev = read("sd_login_" + who.no, null);
    if (prev && prev.day === today()) return setNote(`Already recorded: you submitted your login today at ${fmt(prev.iso)}. No duplicate was added.`);
    setNote(""); setStep(2);
  };
  const submit = async () => {
    if (!p1) return setErr("Add the photo to continue.");
    setBusy(true); setErr(""); setNote("");
    const t = new Date(), shiftId = "S" + t.getTime();
    const r = await sendToSheet({ type: "login", shiftId, empNo: who.no, name: who.name.trim(), team: who.team, dateKey: dateKey(t), loginTime: fmt(t), photoLaptop: p1 });
    if (r === "failed") { setBusy(false); return setErr("Couldn't reach the spreadsheet. " + (lastError || "Check your connection and try again.")); }
    who.remember();
    write("sd_login_" + who.no, { day: today(), iso: t.toISOString(), shiftId });
    if (r === "duplicate") { setBusy(false); return setNote("Already recorded: your login for today is already in the sheet. No duplicate was added."); }
    onDone({ kind: "login", name: who.name, time: fmt(t), local: r === "local" });
  };

  return (
    <section className="card in">
      <h1><Split text="Login" /></h1>
      <Dots step={step} total={2} />
      {step === 1 && <Details who={who} onNext={next} note={note} tone="violet" />}
      {step === 2 && (
        <>
          <div className="clock">{now.toLocaleTimeString()}</div>
          <PhotoBox label="Photo: laptop login page" hint="Show your laptop with Google Meet logged in (take it with the camera)." value={p1} onChange={setP1} />
          <p className="err" key={err}>{err}</p>
          {note && <p className="warn">{note}</p>}
          <button className="btn violet" onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit login"}</button>
          <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
        </>
      )}
    </section>
  );
}

