import { BodyText, MutedText, Row, Screen, SectionHeader } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";
import { BANKROLL, formatMoney, formatPercent } from "@/lib/mock-data";
import { View } from "react-native";

export default function BankrollScreen() {
  const maxStake = BANKROLL.current * BANKROLL.maxStakePercent;
  const dailyCap = BANKROLL.current * BANKROLL.dailyLossLimitPercent;
  const weeklyCap = BANKROLL.current * BANKROLL.weeklyLossLimitPercent;

  return (
    <Screen scroll>
      <SectionHeader
        title="Bankroll"
        subtitle="Discipline first. These caps travel with your research workflow."
      />
      <Row>
        <MutedText>Current bankroll</MutedText>
        <BodyText style={{ fontFamily: fonts.brand, fontSize: 36, marginTop: 4 }}>
          {formatMoney(BANKROLL.current)}
        </BodyText>
        <MutedText style={{ marginTop: 8 }}>
          Monthly research budget {formatMoney(BANKROLL.monthlyBudget)}
        </MutedText>
      </Row>

      <View style={{ height: spacing.sm }} />
      <Limit label="Max stake" value={formatMoney(maxStake)} detail={formatPercent(BANKROLL.maxStakePercent)} />
      <Limit label="Daily loss limit" value={formatMoney(dailyCap)} detail={formatPercent(BANKROLL.dailyLossLimitPercent)} />
      <Limit label="Weekly loss limit" value={formatMoney(weeklyCap)} detail={formatPercent(BANKROLL.weeklyLossLimitPercent)} />
      <Limit label="Kelly fraction" value={String(BANKROLL.kellyFraction)} detail="Fractional sizing" />

      <MutedText style={{ marginTop: spacing.lg, lineHeight: 18 }}>
        Loss bars and live sync land when Supabase is connected. Demo values stay on-device for now.
      </MutedText>
    </Screen>
  );
}

function Limit({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Row>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <BodyText style={{ fontFamily: fonts.bodySemi }}>{label}</BodyText>
        <BodyText style={{ color: colors.primary, fontFamily: fonts.bodySemi }}>{value}</BodyText>
      </View>
      <MutedText style={{ marginTop: 4 }}>{detail}</MutedText>
    </Row>
  );
}
