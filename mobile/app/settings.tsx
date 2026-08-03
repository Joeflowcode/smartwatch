import { BodyText, Button, MutedText, Row, Screen, SectionHeader } from "@/components/ui";
import { colors, fonts, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

type OddsFormat = "american" | "decimal" | "implied";

const PREFS_KEY = "ep_mobile_prefs";

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>("american");
  const [aiHistory, setAiHistory] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as { oddsFormat?: OddsFormat; aiHistory?: boolean };
        if (parsed.oddsFormat) setOddsFormat(parsed.oddsFormat);
        if (typeof parsed.aiHistory === "boolean") setAiHistory(parsed.aiHistory);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function save(next: { oddsFormat: OddsFormat; aiHistory: boolean }) {
    setOddsFormat(next.oddsFormat);
    setAiHistory(next.aiHistory);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  return (
    <Screen scroll>
      <SectionHeader title="Settings" subtitle={session?.email ?? "Local session"} />

      <BodyText style={{ fontFamily: fonts.bodySemi, marginBottom: spacing.sm }}>Odds format</BodyText>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing.lg }}>
        {(["american", "decimal", "implied"] as const).map((fmt) => (
          <Pressable
            key={fmt}
            onPress={() => save({ oddsFormat: fmt, aiHistory })}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: oddsFormat === fmt ? colors.primary : colors.border,
              backgroundColor: oddsFormat === fmt ? colors.secondary : colors.card,
              alignItems: "center",
            }}
          >
            <BodyText style={{ fontSize: 13, textTransform: "capitalize" }}>{fmt}</BodyText>
          </Pressable>
        ))}
      </View>

      <Row
        onPress={() => save({ oddsFormat, aiHistory: !aiHistory })}
      >
        <BodyText style={{ fontFamily: fonts.bodySemi }}>Save AI history on device</BodyText>
        <MutedText style={{ marginTop: 4 }}>{aiHistory ? "On" : "Off"} · local only</MutedText>
      </Row>

      <Row>
        <BodyText style={{ fontFamily: fonts.bodySemi }}>Plan</BodyText>
        <MutedText style={{ marginTop: 4 }}>Free beta · upgrade via web checkout</MutedText>
      </Row>

      <View style={{ marginTop: spacing.lg }}>
        <Button title="Sign out" variant="outline" onPress={() => signOut()} />
        <MutedText style={{ marginTop: spacing.md, fontSize: 11, lineHeight: 16 }}>
          App version 1.0.0 · Bundle ai.edgepilot.app · Terms and Privacy remain counsel placeholders
          on the web site until legal review.
        </MutedText>
      </View>
    </Screen>
  );
}
