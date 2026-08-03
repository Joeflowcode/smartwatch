import {
  BodyText,
  BrandText,
  Button,
  MutedText,
  Pill,
  Row,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import {
  BANKROLL,
  BETS,
  EVENTS,
  EV_ROWS,
  formatAmerican,
  formatKickoff,
  formatMoney,
  formatPercent,
} from "@/lib/mock-data";
import { useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function DashboardScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const topEv = EV_ROWS[0];
  const openBets = BETS.filter((b) => b.status === "open").length;

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(500)}>
        <MutedText style={{ letterSpacing: 1.5, fontSize: 11, color: colors.accent }}>
          EDGEPILOT AI
        </MutedText>
        <SectionHeader
          title={`Hi, ${session?.name?.split(" ")[0] ?? "Analyst"}`}
          subtitle="Today’s research snapshot. Estimates are uncertain."
        />
        <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing.md }}>
          <Pill label="Mock data" tone="warn" />
          <Pill label="Research only" tone="accent" />
        </View>
      </Animated.View>

      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
        <Stat label="Bankroll" value={formatMoney(BANKROLL.current)} />
        <Stat label="Open bets" value={String(openBets)} />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        <Stat label="Max stake" value={formatPercent(BANKROLL.maxStakePercent)} />
        <Stat label="Top edge" value={formatPercent(topEv.edge)} />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Button title="EV scanner" variant="accent" onPress={() => router.push("/(tabs)/scanner")} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Ask AI" variant="outline" onPress={() => router.push("/(tabs)/ai")} />
        </View>
      </View>

      <BrandText style={{ fontSize: 20, marginBottom: spacing.sm }}>Tonight’s slate</BrandText>
      {EVENTS.slice(0, 4).map((event) => (
        <Row key={event.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Pill label={event.sport} />
            <MutedText>{formatKickoff(event.startsAt)}</MutedText>
          </View>
          <BodyText style={{ fontFamily: fonts.bodySemi, fontSize: 16 }}>
            {event.away} @ {event.home}
          </BodyText>
          <MutedText style={{ marginTop: 4 }}>{event.venue}</MutedText>
        </Row>
      ))}

      <BrandText style={{ fontSize: 20, marginTop: spacing.md, marginBottom: spacing.sm }}>
        Top EV
      </BrandText>
      <Row onPress={() => router.push("/(tabs)/scanner")}>
        <BodyText style={{ fontFamily: fonts.bodySemi }}>{topEv.selection}</BodyText>
        <MutedText style={{ marginTop: 4 }}>
          {topEv.eventLabel} · {topEv.sportsbook} · {formatAmerican(topEv.american)}
        </MutedText>
        <BodyText style={{ color: colors.primary, marginTop: 8 }}>
          Edge {formatPercent(topEv.edge)} · EV {formatPercent(topEv.ev)}
        </BodyText>
      </Row>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <MutedText style={{ fontSize: 12 }}>{label}</MutedText>
      <BrandText style={{ fontSize: 22, marginTop: 6 }}>{value}</BrandText>
    </View>
  );
}
