'use client';

import { useState } from 'react';

const ACCENT = 'hsl(120, 70%, 45%)';
const ACCENT_LIGHT = 'hsl(120, 70%, 55%)';

const CLAUSE_TYPES = [
  'Service Agreement',
  'SaaS / Software Contract',
  'Employment Agreement',
  'NDA / Confidentiality Agreement',
  'Licensing Agreement',
  'Partnership / Joint Venture',
  'Purchase / Sales Agreement',
  'Consulting Agreement',
  'Real Estate / Lease',
  'General Contract',
];

export default function ContractAnalyzerPage() {
  const [contractText, setContractText] = useState('');
  const [clauseType, setClauseType] = useState('Service Agreement');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractText.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, clauseType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setOutput(data.output);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-gray-100">
      <div className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: ACCENT }}>
              🔍
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Contract Clause Analyzer</h1>
              <p className="text-sm text-gray-400">Risk Flag Generator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contract Type</label>
            <select
              value={clauseType}
              onChange={(e) => setClauseType(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
            >
              {CLAUSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Contract Text / Clause
            </label>
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste your contract clause, agreement excerpt, or full agreement here..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 resize-none font-mono"
              style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
              rows={15}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:brightness-95"
            style={{ backgroundColor: loading ? ACCENT_LIGHT : ACCENT }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing Contract…
              </span>
            ) : 'Analyze Contract Clause'}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
          )}
        </form>

        <div>
          {output ? (
            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Analysis Results</span>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs px-3 py-1.5 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="p-6 overflow-y-auto" style={{ maxHeight: '600px', color: '#e5e7eb' }}>
                {output.split('\n').map((line, i) => (
                  <p key={i} className="mb-3 leading-relaxed whitespace-pre-wrap">{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center min-h-80 rounded-2xl border border-dashed border-gray-700 text-gray-500 text-sm text-center p-8">
              <div className="text-4xl mb-4 opacity-30">📑</div>
              <p className="font-medium text-gray-400 mb-1">No analysis yet</p>
              <p className="text-xs text-gray-600">Paste contract text and click analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
