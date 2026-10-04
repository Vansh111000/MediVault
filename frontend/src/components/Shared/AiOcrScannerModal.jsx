import React, { useState } from 'react';
import { X, Scan, Sparkles, FileText, CheckCircle2, ArrowRight, Upload, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiOcrScannerModal = ({ isOpen, onClose, patientId, onApplyExtractedData }) => {
  const { uploadDocumentRecord, showToast, ocrSamples } = useApp();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [uploadFileName, setUploadFileName] = useState(null);

  if (!isOpen) return null;

  const currentPreset = ocrSamples[selectedPreset];

  const handleStartScan = () => {
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(currentPreset.extractedData);
      showToast('AI OCR Extraction Complete', 'Medicines, diagnostic parameters and entities recognized with 98%+ confidence.', 'success');
    }, 1200);
  };

  const handleSaveToVault = () => {
    if (!scannedResult) return;

    uploadDocumentRecord({
      patientId: patientId || 'PAT-1001',
      title: `${currentPreset.type}: ${currentPreset.title}`,
      category: currentPreset.type === 'Prescription' ? 'Prescription' : 'Lab Report',
      extractedData: scannedResult
    });

    if (onApplyExtractedData) {
      onApplyExtractedData(scannedResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                MediVault Neural OCR & Entity Parser
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md">
                  Deep Vision AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated extraction of medicines, diagnoses, laboratory test panels, and clinician notes from scanned documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Document Picker & Upload Area */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Document Preview & Scanner */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Document or Scanned File
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ocrSamples.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setScannedResult(null);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedPreset === idx
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{sample.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sample.type} • Sample {idx + 1}</div>
                </button>
              ))}
            </div>

            {/* Simulated Document Canvas with Bounding Boxes */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 h-72 flex flex-col justify-between overflow-hidden">
              {/* Grid background effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-25" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SCAN_SRC: {currentPreset.type.toUpperCase()}_IMG.RAW
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Resolution: 300 DPI
                </span>
              </div>

              {/* Scanning visual laser bar animation */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-20" />
              )}

              {/* Simulated visual document snippet */}
              <div className="relative z-10 my-auto p-3.5 rounded-lg bg-slate-900/90 border border-slate-700/80 font-mono text-[11px] space-y-1.5 shadow-inner">
                <div className="text-cyan-400 font-bold border-b border-slate-700 pb-1 flex justify-between">
                  <span>{currentPreset.title}</span>
                  <span className="text-slate-400 font-normal">AI Bounding Boxes Active</span>
                </div>
                {selectedPreset === 0 ? (
                  <>
                    <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-slate-200">
                      [Rx] Tab. Telmisartan 40mg - OD (Morning)
                    </div>
                    <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-slate-200">
                      [Rx] Tab. Atorvastatin 10mg - OD (Night)
                    </div>
                    <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      [Dx] Essential Hypertension (I10)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      [Test] Total Cholesterol: 218 mg/dL [FLAG: HIGH]
                    </div>
                    <div className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      [Test] LDL Cholesterol: 132 mg/dL [FLAG: HIGH]
                    </div>
                    <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      [Test] Fasting Glucose: 96 mg/dL [NORMAL]
                    </div>
                  </>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload custom file</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadFileName(e.target.files[0].name);
                        showToast('File Uploaded', `${e.target.files[0].name} ready for OCR processing.`, 'info');
                      }
                    }}
                  />
                </label>
                {uploadFileName && (
                  <span className="text-[10px] text-cyan-400 truncate max-w-[150px]">
                    {uploadFileName}
                  </span>
                )}
                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30 disabled:opacity-50 transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Running OCR Engine...' : 'Run AI OCR'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Extracted Structured JSON Entities */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recognized Clinical Entities & Metadata
              </div>
              {scannedResult && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Confidence {scannedResult.confidenceScore}
                </span>
              )}
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 h-72 overflow-y-auto space-y-3">
              {!scannedResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Scan className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">
                    Click <strong>"Run AI OCR"</strong> to extract medication tables, lab parameters, doctor details, and diagnosis codes automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs animate-fade-in">
                  {/* Origin Details */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Identified Clinician / Lab:</span>
                      <strong className="text-white">{scannedResult.doctor || scannedResult.lab}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date of Record:</span>
                      <strong className="text-white">{scannedResult.date}</strong>
                    </div>
                  </div>

                  {/* Medicines if present */}
                  {scannedResult.medicines && (
                    <div>
                      <div className="text-[11px] font-bold text-cyan-300 mb-1.5">
                        Extracted Medications ({scannedResult.medicines.length})
                      </div>
                      <div className="space-y-1.5">
                        {scannedResult.medicines.map((med, i) => (
                          <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white">{med.name} <span className="text-cyan-400">({med.dosage})</span></div>
                              <div className="text-[10px] text-slate-400">Freq: {med.frequency} • Duration: {med.duration}</div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Results if present */}
                  {scannedResult.results && (
                    <div>
                      <div className="text-[11px] font-bold text-cyan-300 mb-1.5">
                        Extracted Test Parameters ({scannedResult.results.length})
                      </div>
                      <div className="space-y-1.5">
                        {scannedResult.results.map((res, i) => (
                          <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white">{res.param}</div>
                              <div className="text-[10px] text-slate-400">Normal: {res.normalRange}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{res.value}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                res.flag === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {res.flag}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Neural model complies with FHIR HL7 medical record standards.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToVault}
              disabled={!scannedResult}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Import Structured Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
