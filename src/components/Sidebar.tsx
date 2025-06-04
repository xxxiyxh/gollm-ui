import { useSessions } from "../contexts/SessionsContext";

export default function Sidebar() {
  const { sessions, currentId, setCurrentId, createSession, deleteSession } = useSessions();

  return (
    <aside className="w-64 border-r flex flex-col">
      <button
        className="p-3 text-left text-blue-600 hover:bg-gray-100"
        onClick={createSession}
      >
        ＋ New Chat
      </button>
      <ul className="flex-1 overflow-y-auto">
        {sessions.map(s => (
          <li
            key={s.id}
            className={
              "flex items-center px-3 py-2 truncate hover:bg-gray-100 " +
              (s.id === currentId ? "bg-gray-200 font-semibold" : "")
            }
            title={s.title}
          >
            <span
              className="flex-1 cursor-pointer"
              onClick={() => setCurrentId(s.id)}
            >
              {s.title}
            </span>
            <button
              className="ml-2 text-red-600"
              onClick={e => {
                e.stopPropagation();
                deleteSession(s.id);
              }}
              title="删除会话"
            >✕</button>
          </li>
        ))}
      </ul>
      
      <button
        className="mt-4 p-3 text-left text-green-700 hover:bg-gray-100"
        onClick={() => window.location.hash = "#template"}
      >📄 模板管理</button>
      <button
        className="mt-1 p-3 text-left text-blue-700 hover:bg-gray-100"
        onClick={() => window.location.hash = ""}
      >
        💬 返回聊天
      </button>
      <button
        className="mt-1 p-3 text-left text-purple-700 hover:bg-gray-100"
        onClick={() => window.location.hash = "#optimizer"}
      >📊 Optimizer</button>

    </aside>
  );
}
