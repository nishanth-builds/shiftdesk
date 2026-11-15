import { useEffect, useRef, useState } from "react";

export default function PhotoBox({ label, hint, value, onChange }) {
  const video = useRef(null), stream = useRef(null);
  const [live, setLive] = useState(false);
  const [msg, setMsg] = useState("");
  const [cams, setCams] = useState([]);
  const [camId, setCamId] = useState("");
  const [tick, setTick] = useState(0);
  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setLive(false); };
  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);
  useEffect(() => { if (live && video.current) { video.current.srcObject = stream.current; video.current.play().catch(() => {}); } }, [live, tick]);

  const open = async (constraint) => {
    stream.current?.getTracks().forEach((t) => t.stop());
    const s = await navigator.mediaDevices.getUserMedia({ video: constraint });
    stream.current = s;
    const cur = s.getVideoTracks()[0]?.getSettings?.().deviceId || "";
    try { setCams((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput")); } catch { /* list unavailable */ }
    setCamId(cur); setLive(true); setTick((n) => n + 1);
  };
  const flip = async () => {
    setMsg("");
    try {
      const i = cams.findIndex((c) => c.deviceId === camId);
      await open({ deviceId: { exact: cams[(i + 1) % cams.length].deviceId } });
    } catch { setMsg("Couldn't switch the camera. Try again."); }
  };
  const start = async () => {
    setMsg("");
    try { await open({ facingMode: "user" }); }
    catch { setMsg("Camera not available. Allow camera access in your browser, then try again."); }
  };
  const snap = () => {
    const v = video.current, vw = v.videoWidth || 640, vh = v.videoHeight || 480, w = Math.min(640, vw), c = document.createElement("canvas");
    c.width = w; c.height = vh * w / vw; c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    onChange(c.toDataURL("image/jpeg", 0.65)); stop();
  };

  return (
    <div className="photo">
      <label>{label}</label>
      <p className="hint">{hint}</p>
      {value ? (
        <>
          <img src={value} alt={label} className="shot" />
          <div className="row2"><button type="button" className="btn ghost small" onClick={() => onChange("")}>Retake</button></div>
        </>
      ) : live ? (
        <>
          <video ref={video} className="shot" playsInline muted />
          <div className="row2">
            <button type="button" className="btn violet small" onClick={snap}>Take photo</button>
            {cams.length > 1 && <button type="button" className="btn ghost small" onClick={flip}>Switch camera</button>}
            <button type="button" className="btn ghost small" onClick={stop}>Cancel</button>
          </div>
        </>
      ) : (
        <div className="row2">
          <button type="button" className="btn violet small" onClick={start}>Open camera</button>
        </div>
      )}
      {msg && <p className="err">{msg}</p>}
    </div>
  );
}

