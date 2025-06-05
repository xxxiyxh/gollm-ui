import { useState, useEffect } from "react";
import Topbar         from "./components/Topbar";
import Sidebar        from "./components/Sidebar";
import ChatPanel      from "./components/ChatPanel";
import TemplateList   from "./components/TemplateList";
import OptimizerPanel from "./components/OptimizerPanel";

export default function App() {
  /* -------------------------------- 路由：监听 hash -------------------------------- */
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  /* -------------------------------  布局：Topbar + 主体  ------------------------------ */
  return (
    <div className="h-screen flex flex-col">
      {/* 头部横栏 */}
      <Topbar />

      {/* 主体：左侧 Sidebar + 右侧内容 */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* 右侧内容区域 (滚动) */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg)]">
          {hash === "#template"   ? <TemplateList   />
           : hash === "#optimizer" ? <OptimizerPanel />
           : /* 默认聊天面板 */     <ChatPanel      />
          }
        </main>
      </div>
    </div>
  );
}
