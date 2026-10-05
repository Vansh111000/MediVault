import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Folder, Eye, Download, ShieldCheck, Building2, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DocumentVault = ({ records, patient, onOpenOcrModal, onExplainRecord }) => {
  const { showToast } = useApp();
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [search, setSearch] = useState('');

  const folders = [
    { name: 'All', count: records.length },
    { name: 'Prescription', count: records.filter(r => r.category === 'Prescription').length },
    { name: 'Lab Report', count: records.filter(r => r.category === 'Lab Report').length },
    { name: 'Diagnostic Imaging', count: records.filter(r => r.category === 'Diagnostic Imaging').length },
    { name: 'Consultation Note', count: records.filter(r => r.category === 'Consultation Note').length }
  ];

  const filtered = records.filter(r => {
    const matchFolder = selectedFolder === 'All' || r.category === selectedFolder;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.hospitalName.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-cyan-400" />
            Encrypted Document Repository
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Store, scan, and manage diagnostic reports with AI OCR and tamper-proof hospital provenance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenOcrModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>AI OCR Scan & Upload</span>
          </button>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {folders.map(f => (
          <button
            key={f.name}
            onClick={() => setSelectedFolder(f.name)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedFolder === f.name
                ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Folder className={`w-4 h-4 ${selectedFolder === f.name ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                {f.count}
              </span>
            </div>
            <div className="text-xs font-bold mt-2 truncate">{f.name}</div>
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-10 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500">
            No documents in this category.
          </div>
        ) : (
          filtered.map(rec => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{rec.title}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">{rec.date} • {rec.category}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-emerald-300 border border-slate-700 flex-shrink-0">
                    {rec.fileAttachment?.size || '350 KB'}
                  </span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">{rec.hospitalName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {rec.id}</span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {rec.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onExplainRecord(rec)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain Report</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast('Document Download', `Downloading ${rec.fileAttachment?.name || 'record.pdf'} with cryptographic verification watermark.`, 'info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
