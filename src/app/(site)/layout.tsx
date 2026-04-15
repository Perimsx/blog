import { Suspense } from "react";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { BackToTop } from "@/components/BackToTop";
import { ContactModal } from "@/components/ContactModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchModal } from "@/components/SearchModal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        id="skip-to-content"
        href="#main-content"
        className="absolute -top-full left-16 z-50 bg-background px-3 py-2 text-accent backdrop-blur-lg transition-all focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
      <Footer noMarginTop />
      <BackToTop />
      <SearchModal />
      <ContactModal />
    </>
  );
}
