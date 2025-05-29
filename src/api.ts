import type { ChatMessage } from "./types";

// --------- 非流式（保留，后面 Optimizer 会用到） ---------
export async function chat(text: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "ollama",
      model: "llama3",
      messages: [{ role: "user", content: text }]
    })
  });
  return res.json();
}

// --------- 流式，带 session_id ---------
export function chatStream(
  sessionId: string,
  messages: ChatMessage[],
  onDelta: (chunk: string) => void,
  onFinish: () => void
) {
  const ctrl = new AbortController();

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: ctrl.signal,
    body: JSON.stringify({
      provider: "ollama",
      model: "llama3",
      stream: true,
      session_id: sessionId,
      messages
    })
  }).then(async res => {
    const reader = res.body!.getReader();
    const dec = new TextDecoder();

    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value);
      // SSE 分块：以 \n\n 分段
      const parts = buf.split("\n\n");
      buf = parts.pop()!;          // 最后一个可能是半截
      for (const p of parts) {
        if (p.startsWith("data:")) {
          const delta = p.slice(5);  // 冒号后的空格被浏览器吃掉
          onDelta(delta);
        }
      }
    }
  }).finally(onFinish);

  // 返回停止函数给前端
  return () => ctrl.abort();
}

export async function clearSessionOnServer(sessionId: string) {
  await fetch(`/api/memory/${sessionId}`, { method: "DELETE" });
}

/* ---------- Prompt Template APIs ---------- */

export interface Template {
  name: string;
  version: number;
  prompt: string;
  system?: string;
  createdAt?: string;   // 后端返回的时间戳（可选）
}

/** 列出某个模板的所有版本（若 name 为空则列出全部最新版本） */
export async function listTemplates(name = ""): Promise<Template[]> {
  const url = name ? `/api/template/${name}?all=1` : "/api/template";
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** 获取模板最新版本或指定版本 */
export async function getTemplate(name: string, ver?: number): Promise<Template> {
  const url = ver === undefined
    ? `/api/template/${name}`
    : `/api/template/${name}/${ver}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** 保存（或新建）一个模板版本 */
export async function saveTemplate(tmpl: Omit<Template, "version" | "createdAt">) {
  const res = await fetch("/api/template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tmpl),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Template>;   // 返回含 version 的最新对象
}

/** 删除指定版本；不传 ver 则删除最新版本 */
export async function deleteTemplate(name: string, ver?: number) {
  const url = ver === undefined
    ? `/api/template/${name}`
    : `/api/template/${name}/${ver}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
