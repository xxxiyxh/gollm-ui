import { useSessions } from "../contexts/SessionsContext";

export default function Sidebar() {
  const { sessions, currentId, setCurrentId, createSession } = useSessions();

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
            onClick={() => setCurrentId(s.id)}
            className={
              "px-3 py-2 cursor-pointer truncate hover:bg-gray-100 " +
              (s.id === currentId ? "bg-gray-200 font-semibold" : "")
            }
            title={s.title}
          >
            {s.title}
          </li>
        ))}
      </ul>
    </aside>
  );
}
