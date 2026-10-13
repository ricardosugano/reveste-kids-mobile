import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { api, uploadToCloudinary } from "../api";
import { useAppTheme } from "../theme";
import { Button, Chip, Input, Message } from "../components/ui";

// Mesmas informações que o formulário do site (AddClothing.jsx) envia
const CATEGORIES = ["Camiseta", "Calça", "Bermuda", "Vestido", "Casaco", "Conjunto", "Calçado", "Outro"];
const SIZES = ["RN", "P", "M", "G", "1", "2", "4", "6", "8", "10", "12", "14"];
const CONDITIONS = ["Nova", "Seminova", "Usada"];
const MAX_MEDIA = 6;

const EMPTY_FORM = { title: "", description: "", category: "", size: "", condition: "" };

export default function AddClothingScreen({ navigation }) {
  const t = useAppTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [media, setMedia] = useState([]); // arquivos escolhidos no celular
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const toggle = (field, value) =>
    setForm((f) => ({ ...f, [field]: f[field] === value ? "" : value }));

  function addAssets(assets, kind) {
    const picked = assets.map((a) => ({
      uri: a.uri,
      fileName: a.fileName,
      mimeType: a.mimeType,
      kind,
    }));
    setMedia((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
  }

  async function pickFromGallery(kind) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [kind === "video" ? "videos" : "images"],
      allowsMultipleSelection: kind === "image",
      selectionLimit: MAX_MEDIA,
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (!result.canceled) addAssets(result.assets, kind);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Libere o acesso à câmera para tirar fotos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) addAssets(result.assets, "image");
  }

  async function handleSave() {
    setError("");
    setStatus("");
    if (!form.title.trim() || !form.description.trim()) {
      setError("Preencha o título e a descrição.");
      return;
    }
    if (media.length === 0) {
      setError("Adicione pelo menos uma foto ou vídeo.");
      return;
    }

    setSaving(true);
    try {
      const uploaded = [];
      for (let i = 0; i < media.length; i++) {
        setStatus(`Enviando mídia ${i + 1} de ${media.length}…`);
        uploaded.push(await uploadToCloudinary(media[i]));
      }

      setStatus("Salvando peça…");
      await api("/clothes", { method: "POST", body: { ...form, media: uploaded } });

      setForm(EMPTY_FORM);
      setMedia([]);
      setStatus("");
      Alert.alert("Pronto!", "Peça cadastrada com sucesso.");
      navigation.navigate("Meu Closet");
    } catch (err) {
      setStatus("");
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.section, { color: t.text }]}>Fotos e vídeo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {media.map((m, i) => (
            <View key={m.uri + i} style={[styles.thumb, { backgroundColor: t.surface }]}>
              {m.kind === "image" ? (
                <Image source={{ uri: m.uri }} style={styles.thumbImage} />
              ) : (
                <View style={styles.videoThumb}>
                  <Ionicons name="videocam" size={28} color={t.primary} />
                  <Text style={{ color: t.muted, fontSize: 12 }}>Vídeo</Text>
                </View>
              )}
              <Pressable
                style={styles.remove}
                hitSlop={8}
                onPress={() => setMedia((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
          {media.length === 0 && (
            <Text style={{ color: t.muted, paddingVertical: 8 }}>
              Nenhuma mídia escolhida ainda.
            </Text>
          )}
        </ScrollView>

        <View style={styles.mediaButtons}>
          <MediaButton icon="images-outline" label="Galeria" onPress={() => pickFromGallery("image")} />
          <MediaButton icon="camera-outline" label="Câmera" onPress={takePhoto} />
          <MediaButton icon="videocam-outline" label="Vídeo" onPress={() => pickFromGallery("video")} />
        </View>

        <Input label="Título" value={form.title} onChangeText={set("title")} placeholder="Ex.: Jaqueta jeans" />
        <Input
          label="Descrição"
          value={form.description}
          onChangeText={set("description")}
          placeholder="Conte como está a peça, marca, detalhes…"
          multiline
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />

        <ChipGroup title="Categoria" options={CATEGORIES} value={form.category} onSelect={(v) => toggle("category", v)} />
        <ChipGroup title="Tamanho" options={SIZES} value={form.size} onSelect={(v) => toggle("size", v)} />
        <ChipGroup title="Estado" options={CONDITIONS} value={form.condition} onSelect={(v) => toggle("condition", v)} />

        <Message text={error} error />
        <Message text={status} />
        <Button title="Cadastrar peça" onPress={handleSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MediaButton({ icon, label, onPress }) {
  const t = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.mediaButton, { borderColor: t.primary }]}>
      <Ionicons name={icon} size={22} color={t.primary} />
      <Text style={{ color: t.text, fontWeight: "600", marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
}

function ChipGroup({ title, options, value, onSelect }) {
  const t = useAppTheme();
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.label, { color: t.muted }]}>{title}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onSelect(o)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  section: { fontSize: 17, fontWeight: "800", marginBottom: 10 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: "600" },
  thumb: { width: 90, height: 112, borderRadius: 12, marginRight: 10, overflow: "hidden" },
  thumbImage: { width: "100%", height: "100%" },
  videoThumb: { flex: 1, alignItems: "center", justifyContent: "center" },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 3,
  },
  mediaButtons: { flexDirection: "row", gap: 10, marginBottom: 20 },
  mediaButton: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap" },
});
