import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-2xl px-4 py-3 ${isSecondary ? "bg-white/10" : "bg-accent-500"} ${disabled ? "opacity-60" : ""}`}
    >
      <Text
        className={`text-sm font-semibold ${isSecondary ? "text-white" : "text-white"}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
