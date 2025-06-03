import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import TemplateList from "./components/TemplateList";

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const f = () => setHash(window.location.hash);
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        {hash === "#template" ? <TemplateList /> : <ChatPanel />}
      </div>
    </div>
  );
}
