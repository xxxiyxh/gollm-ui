import {
    createContext, useContext, useState, useEffect, type ReactNode,
  } from "react";
  import { type Session } from "../types";
  import { clearSessionOnServer } from "../api";
  
  interface Ctx {
    sessions: Session[];
    currentId: string;
    setCurrentId: (id: string) => void;
    createSession: () => void;
    pushUserMsg: (text: string) => void;
    appendDelta: (delta: string) => void;
    finishAssistant: () => void;
    clearCurrent: () => Promise<void>;
  }
  
  const SessionsContext = createContext({} as Ctx);
  export const useSessions = () => useContext(SessionsContext);
  
  export function SessionsProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<Session[]>(() =>
      JSON.parse(localStorage.getItem("sessions") || "[]"),
    );
    const [currentId, setCurrentId] = useState(() =>
      localStorage.getItem("currentId") || "",
    );
  
    // persist
    useEffect(() => {
      localStorage.setItem("sessions", JSON.stringify(sessions));
    }, [sessions]);
    useEffect(() => {
      localStorage.setItem("currentId", currentId);
    }, [currentId]);
  
    // helpers
    function createSession() {
      const id = crypto.randomUUID();
      setSessions(s => [...s, { id, title: "New Chat", messages: [] }]);
      setCurrentId(id);
    }
  
    function mut(mod: (s: Session) => Session) {
      setSessions(all => all.map(s => (s.id === currentId ? mod(s) : s)));
    }
  
    function pushUserMsg(text: string) {
      mut(s => ({
        ...s,
        title: s.title === "New Chat" ? text.slice(0, 20) : s.title,
        messages: [...s.messages, { role: "user", content: text }, { role: "assistant", content: "" }],
      }));
    }
  
    function appendDelta(delta: string) {
      mut(s => {
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        const needsSpace =
          last.content && !/\s$/.test(last.content) && !/^[\s.,!?;:]/.test(delta);
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content + (needsSpace ? " " : "") + delta,
        };
        return { ...s, messages: msgs };
      });
    }
  
    function finishAssistant() {
      // 若要做 loading 状态，可在此回调
    }
  
    async function clearCurrent() {
      await clearSessionOnServer(currentId);
      mut(s => ({ ...s, messages: [] }));
    }
  
    return (
      <SessionsContext.Provider
        value={{
          sessions,
          currentId,
          setCurrentId,
          createSession,
          pushUserMsg,
          appendDelta,
          finishAssistant,
          clearCurrent,
        }}
      >
        {children}
      </SessionsContext.Provider>
    );
  }
  