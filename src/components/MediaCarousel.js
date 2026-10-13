import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

// Um vídeo do feed: toca sozinho quando está visível e pausa quando sai da tela.
// Tocar no vídeo liga/desliga o som.
function VideoSlide({ uri, playing, width, height }) {
  const [muted, setMuted] = useState(false);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [playing, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <Pressable onPress={() => setMuted((m) => !m)}>
      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="cover"
        nativeControls={false}
      />
      {muted && (
        <View style={styles.muteBadge}>
          <Ionicons name="volume-mute" size={18} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

// Carrossel horizontal de fotos e vídeos (equivalente ao MediaCarousel.jsx do site)
export default function MediaCarousel({ media = [], width, height, active }) {
  const [index, setIndex] = useState(0);

  if (!media.length) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Ionicons name="shirt-outline" size={64} color="#bcb0c7" />
        <Text style={{ color: "#bcb0c7", marginTop: 8 }}>Peça sem foto</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={media}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(m, i) => m.url + i}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index: i }) =>
          item.type === "video" ? (
            <VideoSlide
              uri={item.url}
              width={width}
              height={height}
              playing={active && i === index}
            />
          ) : (
            <Image source={{ uri: item.url }} style={{ width, height }} resizeMode="cover" />
          )
        }
      />
      {media.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {media.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", justifyContent: "center", backgroundColor: "#292031" },
  dots: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: { backgroundColor: "#fff", width: 18 },
  muteBadge: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 6,
  },
});
