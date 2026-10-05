import React from 'react';
import { Shield } from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const LandingPageView = ({ onOpenAuth, onNavigateToDoctor, onNavigateToAssistant, onNavigateToPortal }) => {
  const features = [
    {
      title: "Centralized Medical History",
      description: "Aggregates consultation notes, digital prescriptions, and diagnostic lab reports across partner hospitals into one lifetime health archive.",
      points: [
        "Cross-hospital record synchronization",
        "Chronological consultation timeline",
        "Integrated prescription & dosage history"
      ]
    },
    {
      title: "Doctor Consultation Workspace",
      description: "Equips attending physicians with historical vitals, prescription issuance tools, and structured clinical evaluation notes.",
      points: [
        "Fast diagnosis & prescription creation",
        "Real-time vitals and lab review",
        "Cross-doctor protection (only authoring doctor can edit)"
      ]
    },
    {
      title: "Granular Consent & Access Control",
      description: "Puts patients in full control of their medical history with dynamic time-limited tokens and instant revocation.",
      points: [
        "Time-limited (4-hour) visit tokens",
        "Instant one-click access revocation",
        "Immutable audit logs for every record view"
      ]
    },
    {
      title: "Plain-Language Report Explainer",
      description: "Translates complex diagnostic markers, laboratory test values, and medical terminology into clear, patient-friendly terms.",
      points: [
        "Clinical terminology simplified instantly",
        "Key test markers & reference ranges decoded",
        "Clear medicine administration instructions"
      ]
    },
    {
      title: "AI Document OCR Scanner",
      description: "Digitizes physical prescriptions and diagnostic lab slips with automated entity extraction for medications and test values.",
      points: [
        "Automated drug name & dosage extraction",
        "Parses lab panel values and flag markers",
        "Secure digital record generation"
      ]
    },
    {
      title: "Frontdesk & Reception Triage",
      description: "Streamlines patient check-in, token number generation, triage vital entry, and doctor queue assignments.",
      points: [
        "Instant MediVault ID lookup & registration",
        "Triage vitals entry (BP, Pulse, Temp, SpO2)",
        "Automated doctor queue assignments"
      ]
    }
  ];

  return (
    <div
      className="min-h-screen text-slate-900 font-sans flex flex-col justify-between"
      style={{ background: 'linear-gradient(180deg, rgba(15, 118, 110, 0.28) 0%, rgba(15, 118, 110, 0.16) 28%, rgba(15, 118, 110, 0.05) 65%, #ffffff 100%)' }}
    >
      {/* Top Navbar */}
      <div>
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MediVault
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <button onClick={onNavigateToDoctor} className="hover:text-teal-700 transition-colors">For Doctors</button>
              <button onClick={onNavigateToAssistant} className="hover:text-teal-700 transition-colors">For Receptionists</button>
              <button onClick={onNavigateToPortal} className="hover:text-teal-700 transition-colors">For Patient</button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : onNavigateToPortal()}
                className="text-xs font-semibold text-slate-700 hover:text-teal-700 px-3 py-1.5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup') : onNavigateToPortal()}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Get Started</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-[75vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your Medical History.<br />
              Connected, Secure, and Smarter.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              MediVault brings your medical records, prescriptions, test reports, and consultations together in one secure place — helping doctors understand your history and helping you stay informed.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="border-t border-slate-200/80 pt-10 space-y-10">
            {/* Section Header */}
            <div className="space-y-1 text-center max-w-xl mx-auto">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                Platform Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Core Features
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Essential tools built for patient autonomy, clinical efficiency, and cross-hospital interoperability.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {features.map((feature, idx) => (
                <div key={idx} className="border-l-2 border-slate-200 hover:border-teal-700 pl-5 transition-colors space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-1 pt-1 text-[11px] text-slate-700">
                    {feature.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-teal-700 font-bold leading-none mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Clean Bottom Footer */}
      <Footer />
    </div>
  );
};
