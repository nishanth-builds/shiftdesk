import { useEffect, useState } from "react";
import Home from "./components/Home";
import LoginFlow from "./components/LoginFlow";
import LogoutFlow from "./components/LogoutFlow";
import Done from "./components/Done";
import Scene from "./components/Scene";
import logo from "./logo.png";

export default function App() {
  const [view, setView] = useState("home"); // home | login | logout | done
  const [done, setDone] = useState(null);

  useEffect(() => { document.title = "ShiftDesk | Clock in. Report. Improve."; }, []);

  const finish = (info) => { setDone(info); setView("done"); };
  const home = () => { setDone(null); setView("home"); if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search); };

  return (
    <div className="app">
      <div className="bg" aria-hidden="true"><Scene /></div>
      <div className={"wrap" + (view === "home" || view === "done" ? " center" : "") + (view === "home" ? " homewide" : "")}>
        {view !== "home" && (
          <header className="mini">
            <button className="link" onClick={home}>← Home</button>
            <img src={logo} alt="ShiftDesk" className="logo-mini" />
          </header>
        )}
        <div className="screen" key={view}>
          {view === "home" && <Home onPick={setView} />}
          {view === "login" && <LoginFlow onDone={finish} />}
          {view === "logout" && <LogoutFlow onDone={finish} />}
          {view === "done" && done && <Done info={done} onHome={home} />}
        </div>
      </div>
    </div>
  );
}


