import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type SessionUser = {
  id: string;
  email: string;
  isDemo: boolean;
  isAdmin: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email ?? "",
        isDemo: false,
        isAdmin: isAdminUser(user),
      };
    }
  }

  const jar = await cookies();
  const demo = jar.get("ep_demo_user")?.value;
  if (demo) {
    const email = decodeURIComponent(demo);
    return {
      id: "demo-user",
      email,
      isDemo: true,
      isAdmin: false,
    };
  }

  return null;
}

export function isAdminUser(user: User): boolean {
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  return role === "admin";
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
