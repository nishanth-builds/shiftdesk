import { useState } from "react";
import { read, write } from "../utils/storage";

export function useWho() {
  const last = read("sd_last", { empNo: "", name: "", team: "" });
  const [empNo, setEmpNo] = useState(last.empNo || "");
  const [name, setName] = useState(last.name || "");
  const [team, setTeam] = useState(last.team || "");
  const onEmp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 6);
    setEmpNo(d);
    const k = read("sd_people", {})[d];
    if (k) { setName(k.name); setTeam(k.team); }
  };
  const remember = () => {
    const p = { name: name.trim(), team };
    write("sd_last", { empNo, ...p });
    write("sd_people", { ...read("sd_people", {}), [empNo]: p });
  };
  return { empNo, name, team, setTeam, setName: (v) => setName(v.toUpperCase()), onEmp, remember, no: String(Number(empNo)) };
}

