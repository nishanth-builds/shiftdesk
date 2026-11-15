const URL = import.meta.env.VITE_SHEET_URL;
export let lastError = "";

// Sends one record to the Google Sheet.
// Returns "sent", "duplicate" (sheet already has it), "local" (no sheet connected) or "failed".
export async function sendToSheet(payload) {
  if (!URL) return "local";
  const body = JSON.stringify(payload);
  try {
    const res = await fetch(URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body });
    const text = (await res.text()).trim();
    if (text === "duplicate") return "duplicate";
    if (text.startsWith('{"error"')) { lastError = text; return "failed"; }
    if (!res.ok) { lastError = "HTTP " + res.status + " " + text.slice(0, 200); return "failed"; }
    lastError = ""; return "sent";
  } catch {
    // The browser may block reading the reply. Send once more without reading it;
    // the sheet ignores repeats, so this can't create a duplicate row.
    try {
      await fetch(URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body });
      return "sent";
    } catch (e) {
      lastError = "No connection to the sheet link (" + (e && e.message ? e.message : "network error") + "). Check VITE_SHEET_URL and that access is set to Anyone.";
      return "failed";
    }
  }
}
