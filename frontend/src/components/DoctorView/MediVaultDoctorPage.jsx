import React from "react";
import Header from "../Header";
import Hero from "../Hero";
import TrustSection from "../TrustSection";
import HowItWorks from "../HowItWorks";
import AIFeatures from "../AIFeatures";
import PrivacyConsent from "../PrivacyConsent";
import CTA from "../CTA";
import Footer from "../Footer";

export default function MediVaultDoctorPage({ onNavigateToLanding, onOpenAuth, onNavigateToPatient, onNavigateToReceptionist }) {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      <Header
        onNavigateToLanding={onNavigateToLanding}
        onOpenAuth={onOpenAuth}
        onNavigateToPatient={onNavigateToPatient}
        onNavigateToReceptionist={onNavigateToReceptionist}
      />

      <main className="w-full pt-20 bg-background">
        <Hero />
        <TrustSection />
        <HowItWorks />
        <AIFeatures />
        <PrivacyConsent />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
