import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, setToken } from "./api";
import { decodeJwt } from "./jwt";

const AuthContext = createContext(null);

function userFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expirado
  return { _id: payload.id, email: payload.email, role: payload.role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, recupera a sessão salva (substitui o localStorage do site)
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const saved = token ? userFromToken(token) : null;
        if (saved) {
          setToken(token);
          setUser(saved);
        } else if (token) {
          await SecureStore.deleteItemAsync("token");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await api("/auth", {
      method: "POST",
      body: { email: email.trim(), password },
    });
    const logged = userFromToken(data.token);
    if (!logged) throw new Error("Token inválido recebido do servidor");
    await SecureStore.setItemAsync("token", data.token);
    setToken(data.token);
    setUser(logged);
  }

  async function register(name, email, password) {
    await api("/user", {
      method: "POST",
      body: { name: name.trim(), email: email.trim(), password },
    });
    await login(email, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
