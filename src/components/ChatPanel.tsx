import { useEffect, useRef, useState } from "react";
import { chatStream } from "../api";
import { useSessions } from "../contexts/SessionsContext";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, X, Plus, Loader2 } from "lucide-react";

import clsx from "clsx";
import type { ChatMessage } from "../types";

export default function ChatPanel() {
  const {
    sessions,
    currentId,
    setCurrentId,
    createSession,
    pushUserMsg,
    appendDelta,
    finishAssistant,
    clearCurrent,
  } = useSessions();

  const session = sessions.find(s => s.id === currentId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stopRef   = useRef<() => void>(() => {});

  // 根据 hash 切换会话
  useEffect(() => {
    const fn = () => {
      const m = window.location.hash.match(/^#chat\/(.+)/);
      if (m && m[1] && m[1] !== currentId) setCurrentId(m[1]);
    };
    fn();
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, [currentId, setCurrentId]);

  // 滚到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session]);

  if (!session)
    return <div className="p-4 text-center opacity-60">No session selected.</div>;

  // 发送消息
  async function send() {
    const text = input.trim();
    if (!text || sending || !session) return;
    setInput("");
    setSending(true);

    const userMsg = { role: "user", content: text } as const;
    const history: ChatMessage[] = [...session.messages, userMsg];

    pushUserMsg(text);

    stopRef.current = chatStream(
      session.id,
      history,
      appendDelta,
      () => {
        finishAssistant();
        setSending(false);
      },
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* 顶栏：Session info + Buttons */}
      <div className="border-b px-4 py-2 flex justify-between items-center text-sm text-gray-500">
        <div>
          Session <span className="text-gray-400">{session.id.slice(0, 8)}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="New Chat"
            onClick={() => {
              const id = createSession();
              window.location.hash = `#chat/${id}`;
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Clear"
            onClick={clearCurrent}
            className="text-red-600"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* 消息列表 */}
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

      {/* 输入框 */}
      <Card className="m-2 rounded-2xl shadow-lg">
        <CardContent className="flex gap-2 p-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={1}
            placeholder="Message…"
            className="flex-1 resize-none bg-transparent focus-visible:ring-0"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            size="icon"
            className="bg-primary text-white disabled:opacity-50"
            onClick={send}
            disabled={sending}
            title="Send"
          >
            {sending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => stopRef.current?.()}
            title="Stop"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
