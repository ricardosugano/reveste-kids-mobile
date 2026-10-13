import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api, videoThumbnail } from "../api";
import { useAuth } from "../AuthContext";
import { useAppTheme } from "../theme";
import { Button } from "../components/ui";

const GAP = 12;

function coverOf(item) {
  const first = item.media?.[0];
  if (!first) return null;
  return first.type === "video" ? videoThumbnail(first.url) : first.url;
}

export default function MyClosetScreen({ navigation }) {
  const t = useAppTheme();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - GAP * 3) / 2;

  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          hitSlop={10}
          style={{ marginRight: 16 }}
          onPress={() =>
            Alert.alert("Sair", "Deseja sair da sua conta?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive", onPress: logout },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={24} color={t.text} />
        </Pressable>
      ),
    });
  }, [navigation, t, logout]);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api("/my-clothes");
      setClothes(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete(item) {
    Alert.alert("Excluir peça", `Excluir "${item.title}" do seu closet?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/clothes/${item._id}`, { method: "DELETE" });
            setClothes((prev) => prev.filter((c) => c._id !== item._id));
          } catch (err) {
            Alert.alert("Ops", err.message);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{ padding: GAP, flexGrow: 1 }}
      data={clothes}
      numColumns={2}
      keyExtractor={(item) => String(item._id)}
      columnWrapperStyle={{ gap: GAP }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={t.primary}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      ListHeaderComponent={
        <Text style={[styles.header, { color: t.muted }]}>
          {user.email} · {clothes.length} {clothes.length === 1 ? "peça" : "peças"}
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="shirt-outline" size={56} color={t.muted} />
          <Text style={[styles.emptyText, { color: t.muted }]}>
            {error || "Seu closet está vazio. Cadastre a primeira peça!"}
          </Text>
          <Button title="Cadastrar peça" onPress={() => navigation.navigate("Adicionar")} />
        </View>
      }
      renderItem={({ item }) => {
        const cover = coverOf(item);
        const hasVideo = item.media?.some((m) => m.type === "video");
        return (
          <Pressable
            onLongPress={() => confirmDelete(item)}
            style={[styles.card, { width: cardWidth, backgroundColor: t.surface }]}
          >
            {cover ? (
              <Image source={{ uri: cover }} style={{ width: cardWidth, height: cardWidth * 1.25 }} />
            ) : (
              <View style={[styles.noImage, { width: cardWidth, height: cardWidth * 1.25 }]}>
                <Ionicons name="image-outline" size={32} color={t.muted} />
              </View>
            )}
            {hasVideo && (
              <View style={styles.videoBadge}>
                <Ionicons name="play" size={12} color="#fff" />
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={10}>
                <Ionicons name="trash-outline" size={18} color={t.danger} />
              </Pressable>
            </View>
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { marginBottom: 12, fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  emptyText: { textAlign: "center", fontSize: 15 },
  card: { borderRadius: 14, overflow: "hidden" },
  noImage: { alignItems: "center", justifyContent: "center" },
  videoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    padding: 4,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    gap: 8,
  },
  cardTitle: { fontWeight: "700", flex: 1 },
});
