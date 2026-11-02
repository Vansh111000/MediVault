import React from 'react';
import { X, Sparkles, BookOpen, AlertTriangle, Building2, Pill, Activity } from 'lucide-react';
import { SummaryPointsList } from '../../utils/summaryFormatter';

export const PlainLanguageExplainerModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-700 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Plain-Language Medical Report</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                  AI Translation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Translated into simplified, clear language from <strong className="text-slate-800">{record.hospitalName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4 text-sm">
          {/* Document Title Reference */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Document Reference</div>
              <div className="text-slate-900 font-bold text-sm mt-0.5">{record.title}</div>
              <div className="text-xs text-slate-500">{record.date} • {record.doctorName || record.specialty}</div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-800 border border-slate-200">
              {record.category}
            </span>
          </div>

          {/* Simple Explanation Box formatted as clean points */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>What this report means in simple terms:</span>
            </div>
            <SummaryPointsList text={record.plainLanguageExplanation || record.summary} />
          </div>

          {/* Test markers breakdown if test results exist */}
          {record.testResults && record.testResults.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Key Test Markers Decoded
              </h4>
              <div className="grid gap-2">
                {record.testResults.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{t.test}</div>
                      <div className="text-[11px] text-slate-500">Reference standard: {t.reference}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{t.value}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        t.status === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        t.status === 'Borderline' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescribed Medications breakdown */}
          {record.medications && record.medications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Prescription Action Items
              </h4>
              <div className="grid gap-2">
                {record.medications.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-700" />
                        <span>{m.drug} ({m.dosage})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{m.instructions || 'Take as advised'}</div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {m.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-diagnostic disclaimer box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="text-amber-950 font-bold block mb-0.5">Informational Aid Disclaimer:</strong>
              This AI-generated plain language summary is provided strictly as an educational and informational aid to help you understand medical records. It does <strong>NOT</strong> constitute a clinical diagnosis, medical advice, or treatment plan. Always consult your certified doctor for medical decisions.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
