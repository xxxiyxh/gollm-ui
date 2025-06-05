import { useEffect, useState } from "react";
import type { OptResult, Template, Variant } from "../types";
import { listTemplates, runOptimizer } from "../api";

interface Row extends Variant { id: string }

export default function OptimizerPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [varsJson, setVarsJson] = useState('{"input":""}');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OptResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { listTemplates().then(setTemplates); }, []);

  function addRow() {
    setRows(r => [...r, { id: crypto.randomUUID(), provider: "", model: "", tpl: "", version: 1 }]);
  }
  function updateRow(id: string, field: keyof Variant, val: string | number) {
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));
  }
  function delRow(id: string) { setRows(r => r.filter(x => x.id !== id)); }

  async function run() {
    try {
      setRunning(true);
      setError("");
      setResult(null);
      const variants: Variant[] = rows.map(({ ...v }) => v);
      const vars = JSON.parse(varsJson);
      const res = await runOptimizer(variants, vars);
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(String(msg));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Optimizer 对比</h2>

      {/* 变体表单 */}
      <table className="w-full border">
        <thead className="bg-gray-50">
          <tr><th>Provider</th><th>Model</th><th>Template</th><th>Ver</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="text-center">
              <td>
                <select value={r.provider}
                        onChange={e => updateRow(r.id,"provider",e.target.value)}
                        className="border p-1">
                  <option value="">—</option>
                  <option value="ollama">ollama</option>
                  <option value="openai">openai</option>
                  <option value="hf">huggingface</option>
                </select>
              </td>
              <td>
                <input className="border p-1 w-32"
                       value={r.model}
                       onChange={e => updateRow(r.id,"model",e.target.value)} />
              </td>
              <td>
                <select value={r.tpl}
                        onChange={e => updateRow(r.id,"tpl",e.target.value)}
                        className="border p-1">
                  <option value="">—</option>
                  {templates.map(t => (
                    <option key={t.name+ t.version}
                            value={t.name}>{t.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input type="number" className="border p-1 w-14"
                       value={r.version}
                       onChange={e => updateRow(r.id,"version",Number(e.target.value))}/>
              </td>
              <td>
                <button onClick={() => delRow(r.id)} className="text-red-600">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={addRow}>＋ 添加变体</button>

      {/* 变量 JSON */}
      <div>
        <div className="mb-1 font-medium">Vars (JSON)</div>
        <textarea className="border w-full h-24 p-2 font-mono text-sm"
                  value={varsJson}
                  onChange={e => setVarsJson(e.target.value)} />
      </div>

      <button className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-60 transition active:scale-95 shadow-sm"
              disabled={running || rows.length < 2}
              onClick={run}>
        {running ? "Running..." : "Run Compare"}
      </button>

      {/* 错误 */}
      {error && <div className="text-red-600">{error}</div>}

      {/* 结果表格 */}
      {result && (
        <table className="w-full mt-4 border">
          <thead className="bg-gray-50">
            <tr><th>Variant</th><th>Score</th><th>Latency(s)</th><th>Answer</th></tr>
          </thead>
          <tbody>
            {Object.entries(result.scores).map(([key, sc]) => (
              <tr key={key} className={key === result.best.provider+"|"+result.best.model+"|"+result.best.tpl+":"+ (result.best.version||0)
                   ? "bg-yellow-50" : ""}>
                <td className="px-2 py-1 border-r">{key}</td>
                <td>{sc.toFixed(2)}</td>
                <td>{result.latencies[key]?.toFixed(2)}</td>
                <td>
                  <details>
                    <summary className="cursor-pointer text-blue-600 underline">View</summary>
                    <pre className="whitespace-pre-wrap">{result.answers[key]}</pre>
                  </details>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
