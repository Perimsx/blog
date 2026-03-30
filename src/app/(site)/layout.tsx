import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SearchModal } from "@/components/SearchModal";
import { ContactModal } from "@/components/ContactModal";
import { SiteAnnouncement } from "@/components/SiteAnnouncement";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
      <Footer />
      <BackToTop />
      <SearchModal />
      <ContactModal />
      <SiteAnnouncement />
    </>
  );
}
