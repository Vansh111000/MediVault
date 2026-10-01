import Header from "../components/Header";
import Hero from "../components/Hero";
import TrustSection from "../components/TrustSection";
import HowItWorks from "../components/HowItWorks";
import AIFeatures from "../components/AIFeatures";
import PrivacyConsent from "../components/PrivacyConsent";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function LandingPage() {
    return (
        <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
            <Header />

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
