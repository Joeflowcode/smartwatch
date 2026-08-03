import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "ep_mobile_session";
const ONBOARD_KEY = "ep_mobile_onboarded";

export interface Session {
  email: string;
  name: string;
  demo: boolean;
}

interface AuthContextValue {
  ready: boolean;
  session: Session | null;
  onboarded: boolean;
  signInDemo: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [raw, onboard] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(ONBOARD_KEY),
        ]);
        if (raw) setSession(JSON.parse(raw) as Session);
        setOnboarded(onboard === "1");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const signInDemo = useCallback(async () => {
    await persist({ email: "demo@edgepilot.ai", name: "Demo Analyst", demo: true });
  }, [persist]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password) {
        return { ok: false as const, error: "Email and password required." };
      }
      if (password.length < 8) {
        return { ok: false as const, error: "Password must be at least 8 characters." };
      }
      // Native beta: local session until Supabase mobile auth is wired.
      await persist({
        email: email.trim().toLowerCase(),
        name: email.split("@")[0] || "Analyst",
        demo: false,
      });
      return { ok: true as const };
    },
    [persist],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!name.trim()) return { ok: false as const, error: "Name required." };
      if (!email.includes("@")) return { ok: false as const, error: "Valid email required." };
      if (password.length < 8) {
        return { ok: false as const, error: "Password must be at least 8 characters." };
      }
      await persist({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        demo: false,
      });
      return { ok: true as const };
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(ONBOARD_KEY, "1");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      session,
      onboarded,
      signInDemo,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
    }),
    [ready, session, onboarded, signInDemo, signIn, signUp, signOut, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
