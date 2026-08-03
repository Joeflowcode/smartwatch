import { BodyText, BrandText, Button, Field, MutedText, Screen } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await signUp(name, email, password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.lg }}>
        <MutedText>← Back</MutedText>
      </Pressable>
      <BrandText style={{ fontSize: 32, marginBottom: 8 }}>Create account</BrandText>
      <MutedText style={{ marginBottom: spacing.lg }}>
        Research tools only. You must meet the legal gambling age in your jurisdiction.
      </MutedText>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Alex" autoComplete="name" />
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
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
      />
      {error ? (
        <BodyText style={{ color: colors.destructive, marginBottom: spacing.md }}>{error}</BodyText>
      ) : null}
      <Button title="Create account" variant="accent" onPress={submit} loading={loading} />
      <View style={{ marginTop: spacing.lg }}>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <MutedText>
              Already have an account? <BodyText style={{ color: colors.primary }}>Sign in</BodyText>
            </MutedText>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
