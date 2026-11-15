

export const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "medium" });
export const today = () => new Date().toDateString();
export const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const firstName = (n) => { const f = n.trim().split(/[.\s]/)[0].toLowerCase(); return f.charAt(0).toUpperCase() + f.slice(1); };
