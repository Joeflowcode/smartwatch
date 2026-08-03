import { fonts, colors, radii, spacing } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps,
  ScrollView,
  ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export function BrandText({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: fonts.brand, color: colors.foreground }, style]} />;
}

export function BodyText({ style, ...props }: TextProps) {
  return <Text {...props} style={[{ fontFamily: fonts.body, color: colors.foreground }, style]} />;
}

export function MutedText({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: fonts.body, color: colors.mutedForeground, fontSize: 14 }, style]}
    />
  );
}

export function Screen({
  children,
  scroll,
  style,
  contentStyle,
  ...scrollProps
}: ViewProps & {
  scroll?: boolean;
  contentStyle?: ScrollViewProps["contentContainerStyle"];
} & Omit<ScrollViewProps, "contentContainerStyle" | "style">) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={["top"]}>
        <ScrollView
          {...scrollProps}
          contentContainerStyle={[{ padding: spacing.lg, paddingBottom: spacing.xxl }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, { padding: spacing.lg }, style]} edges={["top"]}>
      {children}
    </SafeAreaView>
  );
}

export function HeroBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={["#0c1f19", "#08110e", "#0a1814"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.glow} />
      {children}
    </LinearGradient>
  );
}

type BtnVariant = "primary" | "accent" | "ghost" | "outline";

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewProps["style"];
}) {
  const bg =
    variant === "accent"
      ? colors.accent
      : variant === "primary"
        ? colors.primary
        : variant === "outline"
          ? "transparent"
          : "transparent";
  const fg =
    variant === "accent"
      ? colors.accentForeground
      : variant === "primary"
        ? colors.primaryForeground
        : colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: variant === "outline" || variant === "ghost" ? colors.border : bg,
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ fontFamily: fonts.bodySemi, color: fg, fontSize: 16 }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      <BodyText style={{ fontFamily: fonts.bodyMedium, fontSize: 13 }}>{label}</BodyText>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        {...rest}
        style={[styles.input, style]}
      />
    </View>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <BrandText style={{ fontSize: 28, letterSpacing: -0.5 }}>{title}</BrandText>
      {subtitle ? <MutedText style={{ marginTop: 6, lineHeight: 20 }}>{subtitle}</MutedText> : null}
    </View>
  );
}

export function Row({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewProps["style"];
}) {
  const content = <View style={[styles.row, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "accent" | "warn" }) {
  const bg =
    tone === "accent" ? "rgba(200,245,96,0.15)" : tone === "warn" ? "rgba(251,191,36,0.15)" : colors.muted;
  const fg = tone === "accent" ? colors.accent : tone === "warn" ? colors.amber : colors.mutedForeground;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ fontFamily: fonts.bodyMedium, color: fg, fontSize: 11, letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glow: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: colors.heroGlow,
  },
  btn: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.foreground,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
