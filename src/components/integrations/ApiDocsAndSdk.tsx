import React, { useState, useEffect } from 'react';
import { 
  FileCode, Copy, Check, Terminal, Code2, Server, Globe, ExternalLink, Layers, Search 
} from 'lucide-react';

export const ApiDocsAndSdk: React.FC = () => {
  const [apiVersion, setApiVersion] = useState<'v1' | 'v2'>('v1');
  const [selectedLang, setSelectedLang] = useState<'nodejs' | 'python' | 'curl' | 'php' | 'go'>('nodejs');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('leads');
  const [snippetCode, setSnippetCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [openApiDoc, setOpenApiDoc] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/developer/docs?version=${apiVersion}`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => data && setOpenApiDoc(data))
      .catch(err => console.error(err));
  }, [apiVersion]);

  useEffect(() => {
    fetch(`/api/developer/sdk-snippet?lang=${selectedLang}&endpoint=${selectedEndpoint}`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => data && setSnippetCode(data.snippet || ''))
      .catch(err => console.error(err));
  }, [selectedLang, selectedEndpoint]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpointsList = [
    { id: 'leads', name: 'Leads API', path: '/api/v1/leads', method: 'GET / POST', desc: 'Query captured visitor contact details and metadata' },
    { id: 'tickets', name: 'Tickets API', path: '/api/v1/tickets', method: 'GET / POST', desc: 'Create and retrieve AI customer conversation support tickets' },
    { id: 'workflows', name: 'Workflow Triggers', path: '/api/v1/workflows/trigger', method: 'POST', desc: 'Programmatically trigger automated visual workflow rules' },
    { id: 'integrations', name: 'Integrations Health', path: '/api/v1/integrations/status', method: 'GET', desc: 'Inspect real-time health scores of connected native apps' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">API Documentation & SDK Code Snippet Generator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                OpenAPI 3.0 specification & multi-language client library code generators
              </p>
            </div>
          </div>
        </div>

        {/* API Version Selector */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setApiVersion('v1')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              apiVersion === 'v1' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REST API v1.0 (Stable)
          </button>
          <button
            onClick={() => setApiVersion('v2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              apiVersion === 'v2' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            v2.0-beta (Enterprise)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Endpoint Selection Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Core REST Resources ({apiVersion.toUpperCase()})</span>
            </h3>

            <div className="space-y-2">
              {endpointsList.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedEndpoint === ep.id
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{ep.name}</span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {ep.method}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-indigo-600 font-medium mt-1">
                    {ep.path}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {ep.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication Instructions Card */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <h4 className="font-bold flex items-center space-x-2 text-amber-950">
              <Terminal className="w-4 h-4 text-amber-600" />
              <span>Bearer Authentication Header</span>
            </h4>
            <p className="leading-relaxed text-slate-700">
              All REST API endpoints require standard HTTP Bearer token authentication in your headers:
            </p>
            <code className="block font-mono bg-white p-2 rounded border border-amber-300 text-[11px] text-slate-800">
              Authorization: Bearer sk_live_9f8a3b1c...
            </code>
          </div>
        </div>

        {/* Right Side: Interactive SDK Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            
            {/* SDK Header Bar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  SDK Generator: <span className="text-indigo-400 capitalize">{selectedEndpoint}</span>
                </span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['nodejs', 'python', 'curl', 'php', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-colors capitalize ${
                      selectedLang === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'nodejs' ? 'Node.js' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block Container */}
            <div className="p-5 relative font-mono text-xs">
              <button
                onClick={handleCopyCode}
                className="absolute top-4 right-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              <pre className="text-indigo-300 overflow-x-auto leading-relaxed pt-6">
                <code>{snippetCode || '// Generating snippet...'}</code>
              </pre>
            </div>

            {/* Footer OpenAPI Spec Summary */}
            {openApiDoc && (
              <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>OpenAPI Version: {openApiDoc.openapi}</span>
                <span>Gateway: {openApiDoc.info.title}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
