import { BodyText, MutedText, Pill, Row, Screen, SectionHeader } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import { BETS, formatAmerican, formatMoney } from "@/lib/mock-data";
import { View } from "react-native";

export default function BetsScreen() {
  return (
    <Screen scroll>
      <SectionHeader
        title="Bet tracker"
        subtitle="Log research decisions — not sportsbook tickets."
      />
      {BETS.map((bet) => (
        <Row key={bet.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Pill
              label={bet.status.toUpperCase()}
              tone={bet.status === "won" ? "accent" : bet.status === "lost" ? "warn" : "muted"}
            />
            <MutedText>{new Date(bet.placedAt).toLocaleDateString()}</MutedText>
          </View>
          <BodyText style={{ fontFamily: fonts.bodySemi, fontSize: 17, marginTop: 8 }}>
            {bet.label}
          </BodyText>
          <MutedText style={{ marginTop: 4 }}>
            {formatMoney(bet.stake)} @ {formatAmerican(bet.odds)}
          </MutedText>
          {bet.status === "lost" ? (
            <View
              style={{
                height: 4,
                marginTop: 12,
                borderRadius: 2,
                backgroundColor: colors.chartDown,
                opacity: 0.7,
              }}
            />
          ) : null}
        </Row>
      ))}
    </Screen>
  );
}
