import { useEffect, useRef, useState } from "react";
import { chatStream } from "../api";
import { useSessions } from "../contexts/SessionsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage } from "../types";

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

  // 自动滚动到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session]);

  // 若尚未选择会话
  if (!session)
    return <div className="p-4 text-center opacity-60">No session selected.</div>;

  async function send() {
    const text = input.trim();
    if (!text) return;

    // --- 关键：再次确保 session 已定义 ---
    if (!session) return;

    setInput("");

    const newMsg = { role: "user", content: text } as const;

    const history: ChatMessage[] = [...session.messages, newMsg];

    // 1) 前端本地立即追加 user & 空 assistant
    pushUserMsg(text);

    stopRef.current = chatStream(
      session.id,
      history,
      appendDelta,     // onDelta
      finishAssistant, // onFinish
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* 头部 */}
      <div className="border-b p-2 flex justify-between">
        <div className="text-sm opacity-70">
          Session&nbsp;{session.id.slice(0, 8)}
        </div>
        <button onClick={clearCurrent} className="text-red-600 text-sm">
          Clear
        </button>
      </div>

      {/* 消息列 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {session.messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span
              className={clsx(
                "inline-block max-w-[70%] whitespace-pre-wrap rounded-3xl px-4 py-2 shadow",
                m.role === "user"
                  ? "ml-auto bg-primary/10"
                  : "bg-white dark:bg-white/5",
              )}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入卡片 */}
      <Card className="m-2 rounded-2xl shadow-lg">
        <CardContent className="flex gap-2 p-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={1}
            placeholder="Message…"
            className="flex-1 resize-none bg-transparent focus-visible:ring-0"
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          />
          <Button size="icon" className="bg-primary text-white" onClick={send}>
            <Send className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => stopRef.current?.()}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
