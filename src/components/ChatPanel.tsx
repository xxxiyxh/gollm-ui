import { useEffect, useRef, useState } from "react";
import { chatStream } from "../api";
import { useSessions } from "../contexts/SessionsContext";

export default function ChatPanel() {
  const {
    sessions,
    currentId,
    pushUserMsg,
    appendDelta,
    finishAssistant,
    clearCurrent,
  } = useSessions();
  const session = sessions.find(s => s.id === currentId);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<() => void>(() => {});

  // 滚到最底
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [session]);

  if (!session) return <div className="p-4">No session selected.</div>;

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    pushUserMsg(text);

    stopRef.current = chatStream(
      session!.id,
      session!.messages.concat({ role: "user", content: text }),
      appendDelta,
      finishAssistant,
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* 头部：清空按钮 */}
      <div className="border-b p-2 flex justify-between">
        <div className="text-sm text-gray-500">Session: {session.id.slice(0, 8)}</div>
        <button onClick={clearCurrent} className="text-red-600 text-sm">
          Clear
        </button>
      </div>

      {/* 消息 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {session.messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span
              className={
                "inline-block px-3 py-2 rounded " +
                (m.role === "user" ? "bg-blue-100" : "bg-gray-100")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border px-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Say something…"
        />
        <button onClick={send} className="px-4 bg-blue-600 text-white rounded">
          Send
        </button>
        <button
          onClick={() => stopRef.current?.()}
          className="px-3 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
