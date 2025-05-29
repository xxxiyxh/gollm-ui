import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatPanel />
    </div>
  );
}
