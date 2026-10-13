import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api, ownerIdOf } from "../api";
import { useAuth } from "../AuthContext";
import MediaCarousel from "../components/MediaCarousel";

// Feed estilo TikTok: uma peça por tela, rolagem vertical (FeedTikTok.jsx do site)
export default function FeedScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [clothes, setClothes] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      setError("");
      const [all, likes] = await Promise.all([
        api("/clothes"),
        api("/api/my-likes").catch(() => []),
      ]);
      const others = all
        .filter((item) => ownerIdOf(item) !== String(user._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setClothes(others);
      setLikedIds(likes.map((l) => String(l.clothingId?._id || l.clothingId)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user._id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleLike(item) {
    const id = String(item._id);
    const alreadyLiked = likedIds.includes(id);
    try {
      const data = await api(`/api/like/${id}`, { method: alreadyLiked ? "DELETE" : "POST" });

      setLikedIds((prev) => (alreadyLiked ? prev.filter((x) => x !== id) : [...prev, id]));
      setClothes((prev) =>
        prev.map((c) =>
          String(c._id) === id
            ? { ...c, likesCount: Math.max((c.likesCount || 0) + (alreadyLiked ? -1 : 1), 0) }
            : c
        )
      );

      if (!alreadyLiked && data.matchCreated) {
        Alert.alert(
          "Deu match! 🎉",
          "Vocês demonstraram interesse em trocar peças. A conversa já está disponível em Matches."
        );
      }
    } catch (err) {
      Alert.alert("Ops", err.message);
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }).current;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c084fc" />
        <Text style={styles.hint}>Carregando peças…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && (
        <FlatList
          data={clothes}
          keyExtractor={(item) => String(item._id)}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#fff"
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <View style={[styles.center, { height }]}>
              <Ionicons name="shirt-outline" size={56} color="#bcb0c7" />
              <Text style={styles.hint}>
                {error || "Ainda não há peças de outras pessoas por aqui."}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const liked = likedIds.includes(String(item._id));
            return (
              <View style={{ width, height }}>
                <MediaCarousel
                  media={item.media}
                  width={width}
                  height={height}
                  active={isFocused && index === activeIndex}
                />

                <View style={[styles.info, { paddingBottom: 20 }]} pointerEvents="box-none">
                  <Text style={styles.owner}>
                    @{item.userId?.name || item.userId?.email || "usuário"}
                  </Text>
                  <Text style={styles.title}>{item.title}</Text>
                  {!!item.description && (
                    <Text style={styles.description} numberOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                </View>

                <View style={styles.actions}>
                  <Pressable onPress={() => toggleLike(item)} hitSlop={12} style={styles.action}>
                    <Ionicons
                      name={liked ? "heart" : "heart-outline"}
                      size={38}
                      color={liked ? "#f472b6" : "#fff"}
                    />
                    <Text style={styles.actionText}>{item.likesCount || 0}</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
      <Text style={[styles.brand, { top: insets.top + 8 }]}>ReVeste Kids</Text>
    </View>
  );
}

const shadow = {
  textShadowColor: "rgba(0,0,0,0.75)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#19161e",
    padding: 24,
  },
  hint: { color: "#bcb0c7", marginTop: 12, textAlign: "center", fontSize: 15 },
  brand: {
    position: "absolute",
    alignSelf: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    ...shadow,
  },
  info: {
    position: "absolute",
    left: 0,
    right: 80,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  owner: { color: "#83FCF0", fontWeight: "700", marginBottom: 4, ...shadow },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", ...shadow },
  description: { color: "#f3e8ff", fontSize: 15, marginTop: 4, ...shadow },
  actions: { position: "absolute", right: 12, bottom: 40, alignItems: "center" },
  action: { alignItems: "center", marginTop: 18 },
  actionText: { color: "#fff", fontWeight: "700", marginTop: 2, ...shadow },
});
