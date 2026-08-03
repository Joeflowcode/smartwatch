import { SkipToContent } from "@/components/a11y/skip-to-content";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
