import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">{children}</main>
      <SiteFooter />
    </>
  );
}
