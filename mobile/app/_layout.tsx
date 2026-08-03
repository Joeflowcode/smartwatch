import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { AuthProvider, useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.background);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, session, onboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const root = segments[0];
    const inAuth = root === "(auth)";
    const inOnboard = root === "onboarding";

    if (!session && !inAuth) {
      router.replace("/(auth)/welcome");
      return;
    }
    if (session && !onboarded && !inOnboard) {
      router.replace("/onboarding");
      return;
    }
    if (session && onboarded && (inAuth || inOnboard)) {
      router.replace("/(tabs)");
    }
  }, [ready, session, onboarded, segments, router]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="bankroll" options={{ presentation: "card", headerShown: true, title: "Bankroll", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.foreground }} />
          <Stack.Screen name="bets" options={{ presentation: "card", headerShown: true, title: "Bets", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.foreground }} />
          <Stack.Screen name="settings" options={{ presentation: "card", headerShown: true, title: "Settings", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.foreground }} />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}
