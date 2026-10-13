import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";
import { useAppTheme } from "../theme";
import { Button, Input, Message } from "../components/ui";

export default function LoginScreen({ navigation }) {
  const t = useAppTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={[styles.title, { color: t.text }]}>ReVeste Kids</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>
            Troque as roupas que já não servem por outras que vão servir.
          </Text>

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
          />
          <Message text={error} error />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => navigation.navigate("Register")} style={styles.link}>
            <Text style={{ color: t.muted }}>
              Ainda não tem conta?{" "}
              <Text style={{ color: t.primary, fontWeight: "700" }}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: { width: 96, height: 98, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 30, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", marginTop: 6, marginBottom: 32 },
  link: { marginTop: 20, alignItems: "center", padding: 8 },
});
