import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import type { Template } from "../types";

interface TemplateEditorProps {
  value?: Template;
  onSave: (data: Template) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ value, onSave, onCancel }: TemplateEditorProps) {
  const [data, setData] = useState<Template>({
    name: value?.name || "",
    version: value?.version || 1,
    prompt: value?.prompt || "",
    system: value?.system || "",
    createdAt : value?.createdAt || "",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded shadow-xl w-[600px] p-6 space-y-3 relative">
        <button className="absolute top-2 right-4 text-xl" onClick={onCancel}>×</button>
        <div className="space-y-2">
          <input className="border p-1 w-1/2"
            placeholder="名称"
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
          />
          <input className="border p-1 w-1/2"
            placeholder="版本"
            value={data.version}
            onChange={e => setData(d => ({ ...d, version: Number(e.target.value) }))}
          />
        </div>
        <div>
          <div className="mb-1">Prompt</div>
          <MonacoEditor
            height="120px"
            language="markdown"
            value={data.prompt}
            onChange={(v: string | undefined) => setData(d => ({ ...d, prompt: v || "" }))}
          />
        </div>
        <div>
          <div className="mb-1">System</div>
          <MonacoEditor
            height="60px"
            language="markdown"
            value={data.system}
            onChange={(v: string | undefined) => setData(d => ({ ...d, system: v || "" }))}
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={() => onSave(data)}>
          保存
        </button>
      </div>
    </div>
  );
}
