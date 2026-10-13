import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "../AuthContext";
import { useAppTheme } from "../theme";
import { Button, Input, Message } from "../components/ui";

export default function RegisterScreen() {
  const t = useAppTheme();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleRegister() {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password); // já entra logado
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.text, { color: t.muted }]}>
          Crie sua conta para montar seu closet e começar a trocar.
        </Text>
        <Input label="Nome" value={form.name} onChangeText={set("name")} placeholder="Seu nome" />
        <Input
          label="E-mail"
          value={form.email}
          onChangeText={set("email")}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Senha"
          value={form.password}
          onChangeText={set("password")}
          secureTextEntry
          placeholder="Crie uma senha"
        />
        <Input
          label="Confirmar senha"
          value={form.confirm}
          onChangeText={set("confirm")}
          secureTextEntry
          placeholder="Repita a senha"
        />
        <Message text={error} error />
        <Button title="Criar conta" onPress={handleRegister} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  text: { fontSize: 15, marginBottom: 24 },
});
