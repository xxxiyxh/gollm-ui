import { useEffect, useState } from "react";
import { useSessions } from "../contexts/SessionsContext";
import clsx from "clsx";
import { MessageSquare, FileText, BarChart3 } from "lucide-react";

export default function Sidebar() {
  const {
    sessions,
    currentId,
    setCurrentId,
    createSession,
    deleteSession,
  } = useSessions();

  /* -- 把当前 hash 存到本地 state，监听 hashchange -- */
  const [hash, setHash] = useState(() => window.location.hash || "#chat");
  useEffect(() => {
    const fn = () => setHash(window.location.hash || "#chat");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  /* -- 判断当前在哪个分区 -- */
  const inChat = hash.startsWith("#chat");
  const inTpl = hash.startsWith("#template");
  const inOpt = hash.startsWith("#optimizer");

  return (
    <aside className="w-64 border-r flex flex-col text-sm">
      {/* ========== 固定 Chat 顶栏按钮 ========== */}
      <button
        onClick={() => (window.location.hash = "#chat")}
        className={clsx(
          "mx-3 mt-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-2xl",
          inChat ? "bg-primary/15 text-primary shadow-md" : "hover:bg-primary/10",
        )}
      >
        <MessageSquare className="h-4 w-4 opacity-60" />
        Chats
      </button>

      {/* ========== New Chat 按钮 ========== */}
      <button
        onClick={() => {
          const newId = createSession();
          window.location.hash = `#chat/${newId}`;
        }}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-2xl bg-primary/90 py-2 text-white
                   hover:bg-primary"
      >
        ＋ New Chat
      </button>

      {/* ========== 会话列表 ========== */}
      <h2 className="px-4 pb-1 text-xs font-bold uppercase text-gray-500">
        Sessions
      </h2>
      <ul className="flex-1 overflow-y-auto">
        {sessions.map(s => {
          const active = inChat && s.id === currentId;
          return (
            <li
              key={s.id}
              className={clsx(
                "mx-2 my-1 flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer transition",
                active
                  ? "bg-primary/15 text-primary shadow-md font-medium"
                  : "hover:bg-primary/10",
              )}
              onClick={() => {
                window.location.hash = `#chat/${s.id}`;
                setCurrentId(s.id);
              }}
              title={s.title}
            >
              <MessageSquare className="h-4 w-4 opacity-60" />
              <span className="flex-1 truncate">{s.title}</span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={e => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                title="Delete"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      {/* ========== Tools 分区 ========== */}
      <div className="border-t pt-2 pb-3 space-y-1">
        <button
          onClick={() => (window.location.hash = "#template")}
          className={clsx(
            "flex w-full items-center gap-2 px-4 py-2 rounded-2xl",
            inTpl ? "bg-primary/15 text-primary shadow-md" : "hover:bg-primary/10",
          )}
        >
          <FileText className="h-4 w-4 opacity-70" />
          Templates
        </button>
        <button
          onClick={() => (window.location.hash = "#optimizer")}
          className={clsx(
            "flex w-full items-center gap-2 px-4 py-2 rounded-2xl",
            inOpt ? "bg-primary/15 text-primary shadow-md" : "hover:bg-primary/10",
          )}
        >
          <BarChart3 className="h-4 w-4 opacity-70" />
          Optimizer
        </button>
      </div>
    </aside>
  );
}
