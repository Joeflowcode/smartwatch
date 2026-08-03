import { cookies } from "next/headers";
import { AppShell } from "@/components/app/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  let email = "demo@edgepilot.ai";

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) email = user.email;
  } else {
    const jar = await cookies();
    const demo = jar.get("ep_demo_user")?.value;
    if (demo) email = decodeURIComponent(demo);
  }

  return <AppShell email={email}>{children}</AppShell>;
}
