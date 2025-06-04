import { useEffect, useState } from "react";
import {
  listTemplates,
  getTemplate,
  deleteTemplate,
  saveTemplate,
} from "../api";
import TemplateEditor from "./TemplateEditor";
import type { Template } from "../types";

export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  async function refresh() {
    setTemplates(await listTemplates());
  }
  useEffect(() => { refresh(); }, []);

  async function edit(name: string, version: number) {
    setEditing(await getTemplate(name, version));
    setShowEditor(true);
  }
  async function onDelete(name: string, version: number) {
    await deleteTemplate(name, version);
    refresh();
  }
  async function onSave(data: Template) {
    await saveTemplate(data);
    setShowEditor(false);
    refresh();
  }

  return (
    <div className="p-4">
      <button className="mb-2 bg-blue-600 text-white px-2 py-1 rounded"
        onClick={() => { setEditing(null); setShowEditor(true); }}>+ 新建模板</button>
      <table className="w-full">
        <thead><tr>
          <th>名称</th><th>版本</th><th>操作</th>
        </tr></thead>
        <tbody>
          {templates.map(t => (
            <tr key={t.name + t.version}>
              <td>{t.name}</td>
              <td>{t.version}</td>
              <td>
                <button onClick={() => edit(t.name, t.version)}
                  className="text-blue-600 px-2">编辑</button>
                <button onClick={() => onDelete(t.name, t.version)}
                  className="text-red-600 px-2">删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showEditor &&
        <TemplateEditor
          value={editing || undefined}
          onSave={onSave}
          onCancel={() => setShowEditor(false)}
        />}
    </div>
  );
}
