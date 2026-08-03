import {
  BodyText,
  Button,
  MutedText,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { SUGGESTED_PROMPTS, mockAiReply } from "@/lib/mock-data";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Ask about tonight’s slate, EV math, or bankroll sizing. I ground answers in available research data and will refuse guaranteed-winner prompts.",
};

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 450));
    setMessages((m) => [...m, { role: "assistant", content: mockAiReply(trimmed) }]);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={8}
    >
      <Screen style={{ paddingBottom: 0 }}>
        <SectionHeader
          title="Ask AI"
          subtitle="On-device mock coach until your API URL is configured."
        />
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.md, gap: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <View
              key={`${msg.role}-${i}`}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "92%",
                backgroundColor: msg.role === "user" ? colors.secondary : colors.card,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
              }}
            >
              <BodyText style={{ lineHeight: 22 }}>{msg.content}</BodyText>
            </View>
          ))}
          {loading ? <MutedText>Thinking…</MutedText> : null}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.sm }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <Pressable
                key={p}
                onPress={() => send(p)}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: colors.muted,
                }}
              >
                <MutedText style={{ fontSize: 12 }}>{p}</MutedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 8, paddingTop: spacing.sm, alignItems: "flex-end" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about EV, slate, or stakes…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={{
              flex: 1,
              minHeight: 48,
              maxHeight: 120,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.foreground,
              fontFamily: fonts.body,
              fontSize: 16,
            }}
          />
          <Button title="Send" onPress={() => send(input)} loading={loading} style={{ minWidth: 88 }} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
