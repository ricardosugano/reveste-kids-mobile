import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "../theme";

export function Button({ title, onPress, loading, disabled, variant = "primary" }) {
  const t = useAppTheme();
  const isPrimary = variant === "primary";
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: t.primaryStrong }
          : { borderWidth: 1.5, borderColor: t.primary },
        (pressed || off) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : t.primary} />
      ) : (
        <Text style={[styles.buttonText, { color: isPrimary ? "#fff" : t.primary }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Input({ label, style, ...props }) {
  const t = useAppTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[styles.label, { color: t.muted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={t.muted}
        style={[
          styles.input,
          { backgroundColor: t.surface, color: t.text, borderColor: t.border },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  const t = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: t.primary },
        selected && { backgroundColor: t.primary },
      ]}
    >
      <Text style={{ color: selected ? "#1d1922" : t.text, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Message({ text, error }) {
  const t = useAppTheme();
  if (!text) return null;
  return (
    <Text
      style={{
        color: error ? t.danger : t.dark ? t.accent : t.primaryStrong,
        marginBottom: 12,
        fontWeight: "600",
      }}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
});
