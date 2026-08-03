import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { SkipToContent } from "@/components/a11y/skip-to-content";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
