import { useColorScheme } from "react-native";

// Mesmas cores do site (frontend/src/index.css)
const dark = {
  dark: true,
  bg: "#19161e",
  surface: "#292031",
  text: "#f3e8ff",
  muted: "#bcb0c7",
  primary: "#c084fc",
  primaryStrong: "#8b5cf6",
  accent: "#83FCF0",
  border: "#3a2f45",
  danger: "#f87171",
};

const light = {
  dark: false,
  bg: "#e5d5f8",
  surface: "#ffffff",
  text: "#1d1922",
  muted: "#6b7280",
  primary: "#8b5cf6",
  primaryStrong: "#6d28d9",
  accent: "#83FCF0",
  border: "#cba7ef",
  danger: "#dc2626",
};

// O tema segue o modo claro/escuro do celular
export function useAppTheme() {
  return useColorScheme() === "light" ? light : dark;
}
