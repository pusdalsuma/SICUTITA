import React, { useState } from 'react';
import { appsScriptCodeGs, appsScriptIndexHtml, appsScriptGuide } from '../appsScriptTemplate';

export const AppsScriptExporter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'gs' | 'html'>('guide');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceCode = () => {
    switch (activeTab) {
      case 'gs':
        return appsScriptCodeGs;
      case 'html':
        return appsScriptIndexHtml;
      default:
        return appsScriptGuide;
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            Google Apps Script Deployer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan kode ini untuk memasang sistem pengajuan cuti langsung di Spreadsheet & Google Workspace Anda.
          </p>
        </div>
        
        {activeTab !== 'guide' && (
          <button
            onClick={() => copyToClipboard(getSourceCode())}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-white font-medium text-xs rounded-lg transition border border-slate-700 flex items-center gap-1.5 self-start md:self-auto"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Salin Kode</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mt-6">
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
            activeTab === 'guide'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          📖 Panduan Pemasangan
        </button>
        <button
          onClick={() => setActiveTab('gs')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
            activeTab === 'gs'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          ⚙️ Code.gs
        </button>
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
            activeTab === 'html'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          🌐 Index.html
        </button>
      </div>

      {/* Code / Markdown View */}
      <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs text-slate-350">
        {activeTab === 'guide' ? (
          <div className="p-6 font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
            <p className="font-semibold text-white text-base">Kenapa menggunakan Google Apps Script?</p>
            <p>
              Dengan memindahkan formulir cuti ke **Google Apps Script**, semua pengajuan otomatis direkap ke dalam **Google Sheets** dinas Anda. Pegawai dapat mengaksesnya secara online tanpa perlu server hosting mandiri, dan integrasi Google Workspace berjalan mulus.
            </p>
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/60 leading-relaxed">
              {appsScriptGuide.split('\n\n').map((para, idx) => (
                <p key={idx} className="mb-3">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-x-auto max-h-[480px]">
            <pre className="text-slate-300 leading-relaxed text-[11px] select-all">
              {activeTab === 'gs' ? appsScriptCodeGs : appsScriptIndexHtml}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
