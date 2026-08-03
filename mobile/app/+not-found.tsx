import { Link, Stack } from "expo-router";
import { BrandText, Button, MutedText, Screen } from "@/components/ui";
import { spacing } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Missing", headerShown: true }} />
      <Screen>
        <BrandText style={{ fontSize: 28 }}>Screen not found</BrandText>
        <MutedText style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
          That route isn’t in the EdgePilot mobile app.
        </MutedText>
        <Link href="/" asChild>
          <Button title="Go home" onPress={() => undefined} />
        </Link>
      </Screen>
    </>
  );
}
