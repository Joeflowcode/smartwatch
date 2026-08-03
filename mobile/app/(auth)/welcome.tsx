import { APP_NAME, APP_TAGLINE, LEGAL_DISCLAIMER, colors, fonts, spacing } from "@/constants/theme";
import { BodyText, BrandText, Button, HeroBackdrop, MutedText } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInDemo } = useAuth();
  const [loading, setLoading] = useState(false);

  async function enterDemo() {
    setLoading(true);
    try {
      await signInDemo();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.heroDeep }}>
      <HeroBackdrop>
        <SafeAreaView style={styles.safe}>
          <Animated.View entering={FadeInUp.duration(700)} style={styles.brandBlock}>
            <MutedText style={styles.eyebrow}>ANALYTICS · NOT A SPORTSBOOK</MutedText>
            <BrandText style={styles.brand}>{APP_NAME}</BrandText>
            <BodyText style={styles.tagline}>{APP_TAGLINE}</BodyText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.actions}>
            <Button title="Continue with demo" variant="accent" onPress={enterDemo} loading={loading} />
            <Button title="Sign in" variant="outline" onPress={() => router.push("/(auth)/login")} />
            <Button title="Create account" variant="ghost" onPress={() => router.push("/(auth)/signup")} />
            <MutedText style={styles.legal}>{LEGAL_DISCLAIMER}</MutedText>
          </Animated.View>
        </SafeAreaView>
      </HeroBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  brandBlock: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 2.2,
    fontSize: 11,
    color: colors.accent,
    fontFamily: fonts.bodyMedium,
  },
  brand: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.mutedForeground,
    maxWidth: 320,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.md,
    opacity: 0.85,
  },
});
