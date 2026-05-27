import { ReactNode } from "react";
import { ScrollView, View } from "react-native";

type ScreenProps = {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
};

export function Screen({
  children,
  className = "",
  scroll = true,
}: ScreenProps) {
  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 bg-surface-950 ${className}`}
        contentContainerClassName="flex-grow"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-1 bg-surface-950 ${className}`}>{children}</View>
  );
}
