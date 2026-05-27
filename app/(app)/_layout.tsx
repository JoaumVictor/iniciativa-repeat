import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#1f2937",
        },
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "Itens",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cube-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
