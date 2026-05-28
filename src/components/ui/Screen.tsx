import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView edges={["top"]} className="flex-1 bg-surface-950">
        <ScrollView
          className="flex-1"
          contentContainerClassName={`flex-grow pb-8 ${className}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 bg-surface-950 ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}
