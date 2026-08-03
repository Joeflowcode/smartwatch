import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isApp = path.startsWith("/app");
  const isAdmin = path.startsWith("/admin");
  const isOnboarding = path.startsWith("/app/onboarding");
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/reset-password");

  if (!url || !key) {
    const demoUser = request.cookies.get("ep_demo_user")?.value;
    if ((isApp || isAdmin) && !demoUser) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }
    if (isAdmin) {
      // Demo mode: admin UI is view-only metrics; block write assumptions.
      return supabaseResponse;
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const demoUser = request.cookies.get("ep_demo_user")?.value;
  const isAuthenticated = Boolean(user || demoUser);

  if ((isApp || isAdmin) && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdmin) {
    const role = (user?.app_metadata as { role?: string } | undefined)?.role;
    const allowlisted = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const emailOk = user?.email ? allowlisted.includes(user.email.toLowerCase()) : false;
    if (role !== "admin" && !emailOk) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isApp && !isOnboarding) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed_at) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app/onboarding";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

/** Service-role client for webhooks/jobs only. Never import in client components. */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
