import { BodyText, Button, MutedText, Row, Screen, SectionHeader } from "@/components/ui";
import { APP_NAME, colors, fonts, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";
import { Linking, View } from "react-native";

const LINKS = [
  { title: "Bankroll", href: "/bankroll", subtitle: "Limits, Kelly fraction, loss caps" },
  { title: "Bet tracker", href: "/bets", subtitle: "Open and settled research logs" },
  { title: "Settings", href: "/settings", subtitle: "Odds format, alerts, account" },
] as const;

export default function MoreScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  return (
    <Screen scroll>
      <SectionHeader title="More" subtitle={`${APP_NAME} · ${session?.email ?? ""}`} />

      {LINKS.map((link) => (
        <Row key={link.href} onPress={() => router.push(link.href)}>
          <BodyText style={{ fontFamily: fonts.bodySemi, fontSize: 17 }}>{link.title}</BodyText>
          <MutedText style={{ marginTop: 4 }}>{link.subtitle}</MutedText>
        </Row>
      ))}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button
          title="Responsible use (web)"
          variant="outline"
          onPress={() => Linking.openURL("https://edgepilot.ai/responsible-use")}
        />
        <Button title="Sign out" variant="ghost" onPress={() => signOut()} />
        <MutedText style={{ fontSize: 11, lineHeight: 16, marginTop: spacing.sm }}>
          Analytics only. Must meet legal age. Never wager money you cannot afford to lose.
        </MutedText>
        <MutedText style={{ color: colors.mutedForeground, fontSize: 11 }}>
          {session?.demo ? "Demo session · local device only" : "Local beta session"}
        </MutedText>
      </View>
    </Screen>
  );
}
