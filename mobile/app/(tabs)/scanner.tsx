import { BodyText, MutedText, Pill, Row, Screen, SectionHeader } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";
import { EV_ROWS, formatAmerican, formatPercent } from "@/lib/mock-data";
import { View } from "react-native";

export default function ScannerScreen() {
  const sorted = [...EV_ROWS].sort((a, b) => b.edge - a.edge);

  return (
    <Screen scroll>
      <SectionHeader
        title="EV scanner"
        subtitle="Illustrative edges from mock model probabilities. Not betting advice."
      />
      <Pill label="Sorted by edge" tone="accent" />
      <View style={{ height: spacing.md }} />

      {sorted.map((row, i) => (
        <Row key={row.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pill label={`#${i + 1} · ${row.sport}`} />
            <BodyText style={{ fontFamily: fonts.bodySemi, color: colors.primary }}>
              {formatPercent(row.edge)} edge
            </BodyText>
          </View>
          <BodyText style={{ fontFamily: fonts.bodySemi, fontSize: 17, marginTop: 10 }}>
            {row.selection}
          </BodyText>
          <MutedText style={{ marginTop: 4 }}>
            {row.eventLabel} · {row.sportsbook} · {formatAmerican(row.american)}
          </MutedText>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            <Meta label="EV" value={formatPercent(row.ev)} />
            <Meta label="Model" value={formatPercent(row.modelProb)} />
          </View>
        </Row>
      ))}
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <MutedText style={{ fontSize: 11 }}>{label}</MutedText>
      <BodyText style={{ fontFamily: fonts.bodyMedium }}>{value}</BodyText>
    </View>
  );
}
