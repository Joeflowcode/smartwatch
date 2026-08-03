import { BodyText, BrandText, Button, Field, MutedText, Screen } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.lg }}>
        <MutedText>← Back</MutedText>
      </Pressable>
      <BrandText style={{ fontSize: 32, marginBottom: 8 }}>Sign in</BrandText>
      <MutedText style={{ marginBottom: spacing.lg }}>
        Email and password for the beta. Native Supabase auth wires in with your project keys.
      </MutedText>
      <Field
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
      />
      <Field
        label="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
      />
      {error ? (
        <BodyText style={{ color: colors.destructive, marginBottom: spacing.md }}>{error}</BodyText>
      ) : null}
      <Button title="Sign in" onPress={submit} loading={loading} />
      <View style={{ marginTop: spacing.lg }}>
        <Link href="/(auth)/signup" asChild>
          <Pressable>
            <MutedText>
              Need an account? <BodyText style={{ color: colors.primary }}>Create one</BodyText>
            </MutedText>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
