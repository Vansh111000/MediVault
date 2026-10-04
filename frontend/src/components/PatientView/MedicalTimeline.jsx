import React, { useState } from 'react';
import { SummaryPointsList } from '../../utils/summaryFormatter';
import {
  Clock,
  Building2,
  Stethoscope,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  Eye,
  Pill,
  Activity,
  Calendar
} from 'lucide-react';

export const MedicalTimeline = ({ records, onExplainRecord, onOpenRecordDetail }) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Prescription', 'Lab Report', 'Diagnostic Imaging', 'Consultation Note'];

  const filteredRecords = records.filter(r => {
    const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.medications && r.medications.some(m => m.drug.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (r.diagnoses && r.diagnoses.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conditions, medicines (e.g. Telmisartan), doctors, tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-emerald-500 before:to-slate-800">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No medical records match your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for different keywords or reset filter.</p>
          </div>
        ) : (
          filteredRecords.map((record, index) => (
            <div key={record.id} className="relative group">
              {/* Timeline node icon indicator */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 border-2 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                {record.category === 'Prescription' ? (
                  <Pill className="w-3.5 h-3.5 text-cyan-400" />
                ) : record.category === 'Lab Report' ? (
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>

              {/* Record Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 p-5 shadow-xl transition-all duration-300 backdrop-blur-md">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                      {record.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {record.date}
                    </span>
                  </div>

                  {/* Hospital Provenance Badge (Critical for cross-hospital trust) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-slate-200">{record.hospitalName}</span>
                    </div>
                    {record.isImmutable && (
                      <span
                        title="Cryptographically immutable record. Cannot be altered or deleted by other hospitals."
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Immutable
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="mt-3.5">
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {record.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{record.doctorName} • <span className="text-slate-300">{record.specialty}</span></span>
                  </div>

                  {/* Summary / Notes formatted into clean points */}
                  <SummaryPointsList text={record.summary} />

                  {/* Prescribed Medications Preview */}
                  {record.medications && record.medications.length > 0 && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-cyan-300 mb-1.5 flex items-center gap-1">
                        <Pill className="w-3 h-3" /> Prescribed Medications:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.medications.map((m, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-200"
                          >
                            <strong className="text-white">{m.drug}</strong> {m.dosage} • {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Test Results Preview */}
                  {record.testResults && record.testResults.length > 0 && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-cyan-300 mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Diagnostic Parameters:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {record.testResults.slice(0, 4).map((t, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                            <div className="text-slate-400 truncate">{t.test}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-mono font-bold text-white">{t.value}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                t.status === 'High' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {record.id}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Plain Language Explainer Button */}
                    <button
                      onClick={() => onExplainRecord(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Explain in Simple Terms</span>
                    </button>

                    {/* View Full Document */}
                    {record.fileAttachment && (
                      <button
                        onClick={() => onOpenRecordDetail && onOpenRecordDetail(record)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.fileAttachment.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
