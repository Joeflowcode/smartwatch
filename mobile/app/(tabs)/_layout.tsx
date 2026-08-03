import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Text } from "react-native";
import { colors, fonts } from "@/constants/theme";

function TabIcon({
  ios,
  android,
  color,
}: {
  ios: string;
  android: string;
  color: string;
}) {
  if (Platform.OS === "web") {
    return <Text style={{ color, fontSize: 16 }}>•</Text>;
  }
  return (
    <SymbolView
      name={{ ios: ios as never, android: android as never, web: android as never }}
      tintColor={color}
      size={24}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabIcon ios="square.grid.2x2.fill" android="dashboard" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="odds"
        options={{
          title: "Odds",
          tabBarIcon: ({ color }) => (
            <TabIcon ios="chart.bar.fill" android="bar_chart" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => (
            <TabIcon ios="scope" android="radar" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color }) => (
            <TabIcon ios="sparkles" android="auto_awesome" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <TabIcon ios="ellipsis.circle.fill" android="more_horiz" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
