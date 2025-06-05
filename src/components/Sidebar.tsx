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

  return (
    <aside className="w-64 border-r flex flex-col text-sm">
      {/* 新建按钮 */}
      <button
        onClick={createSession}
        className="m-3 w-[calc(100%-1.5rem)] rounded-2xl bg-primary/90 py-2 text-white
                   hover:bg-primary"
      >
        ＋ New Chat
      </button>

      {/* Chats 分区 */}
      <h2 className="px-4 pb-1 text-xs font-bold uppercase text-gray-500">
        Chats
      </h2>
      <ul className="flex-1 overflow-y-auto">
        {sessions.map(s => (
          <li
            key={s.id}
            className={clsx(
              "mx-2 my-1 flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer",
              "transition hover:bg-primary/10",
              s.id === currentId &&
                "bg-primary/15 text-primary shadow-md font-medium",
            )}
            onClick={() => setCurrentId(s.id)}
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
        ))}
      </ul>

      {/* Tools 分区 */}
      <div className="border-t pt-2 pb-3 space-y-1">
        <button
          onClick={() => (window.location.hash = "#template")}
          className="flex w-full items-center gap-2 px-4 py-2 hover:bg-primary/10"
        >
          <FileText className="h-4 w-4 opacity-70" />
          Templates
        </button>
        <button
          onClick={() => (window.location.hash = "#optimizer")}
          className="flex w-full items-center gap-2 px-4 py-2 hover:bg-primary/10"
        >
          <BarChart3 className="h-4 w-4 opacity-70" />
          Optimizer
        </button>
      </div>
    </aside>
  );
}
