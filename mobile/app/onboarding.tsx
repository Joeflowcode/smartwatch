import { BodyText, BrandText, Button, MutedText, Screen } from "@/components/ui";
import { LEGAL_DISCLAIMER, colors, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [ageOk, setAgeOk] = useState(false);
  const [researchOk, setResearchOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = ageOk && researchOk;

  async function finish() {
    if (!canContinue) return;
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
    setLoading(false);
  }

  return (
    <Screen scroll>
      <BrandText style={{ fontSize: 32, marginBottom: 8 }}>Before you research</BrandText>
      <MutedText style={{ marginBottom: spacing.lg, lineHeight: 20 }}>
        EdgePilot is for adults who want analytics — odds comparison, EV estimates, and bankroll
        discipline. Confirm the gates below to continue.
      </MutedText>

      <CheckRow
        checked={ageOk}
        onToggle={() => setAgeOk((v) => !v)}
        title="I meet the legal gambling age where I live"
        subtitle="Requirements vary by jurisdiction."
      />
      <CheckRow
        checked={researchOk}
        onToggle={() => setResearchOk((v) => !v)}
        title="I understand this is research, not a sportsbook"
        subtitle="No wagers are placed or accepted in the app."
      />

      <BodyText style={{ fontSize: 12, lineHeight: 18, color: colors.mutedForeground, marginVertical: spacing.lg }}>
        {LEGAL_DISCLAIMER}
      </BodyText>

      <Button
        title="Enter EdgePilot"
        variant="accent"
        onPress={finish}
        disabled={!canContinue}
        loading={loading}
      />
    </Screen>
  );
}

function CheckRow({
  checked,
  onToggle,
  title,
  subtitle,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={{
        flexDirection: "row",
        gap: 14,
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: checked ? colors.primary : colors.border,
        backgroundColor: colors.card,
        marginBottom: spacing.sm,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : "transparent",
          marginTop: 2,
        }}
      />
      <View style={{ flex: 1 }}>
        <BodyText style={{ fontSize: 16 }}>{title}</BodyText>
        <MutedText style={{ marginTop: 4 }}>{subtitle}</MutedText>
      </View>
    </Pressable>
  );
}
