import { BodyText, MutedText, Pill, Row, Screen, SectionHeader } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";
import { EVENTS, ODDS, formatAmerican, formatKickoff } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL"] as const;

export default function OddsScreen() {
  const [sport, setSport] = useState<(typeof SPORTS)[number]>("All");

  const events = useMemo(
    () => EVENTS.filter((e) => sport === "All" || e.sport === sport),
    [sport],
  );

  return (
    <Screen scroll>
      <SectionHeader
        title="Odds"
        subtitle="Compare moneyline quotes across books. Mock feed for beta UI."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md }}>
        {SPORTS.map((s) => (
          <Pressable key={s} onPress={() => setSport(s)}>
            <Pill label={s} tone={sport === s ? "accent" : "muted"} />
          </Pressable>
        ))}
      </View>

      {events.map((event) => {
        const quotes = ODDS.filter((o) => o.eventId === event.id && o.market === "moneyline");
        return (
          <Row key={event.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Pill label={event.sport} />
              <MutedText>{formatKickoff(event.startsAt)}</MutedText>
            </View>
            <BodyText style={{ fontFamily: fonts.bodySemi, fontSize: 17, marginTop: 8 }}>
              {event.away} @ {event.home}
            </BodyText>
            <View style={{ marginTop: spacing.sm, gap: 8 }}>
              {quotes.map((q) => (
                <View
                  key={q.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 6,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <BodyText style={{ fontSize: 14 }}>{q.selection}</BodyText>
                    <MutedText style={{ fontSize: 12 }}>{q.sportsbook}</MutedText>
                  </View>
                  <BodyText style={{ fontFamily: fonts.bodySemi, color: colors.primary }}>
                    {formatAmerican(q.american)}
                  </BodyText>
                </View>
              ))}
              {quotes.length === 0 ? <MutedText>No moneyline quotes in mock set.</MutedText> : null}
            </View>
          </Row>
        );
      })}
    </Screen>
  );
}
