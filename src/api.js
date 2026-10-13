import { API_URL, CLOUDINARY } from "./config";

let authToken = null;

export function setToken(token) {
  authToken = token;
}

// Equivalente ao fetchData() do site (frontend/src/services/api.js)
export async function api(endpoint, { method = "GET", body } = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro HTTP: ${response.status}`);
  }
  return data;
}

// Envia uma foto ou vídeo do celular para o Cloudinary
// e devolve no formato que o backend espera: { type, url }
export async function uploadToCloudinary(asset) {
  const kind = asset.kind === "video" ? "video" : "image";
  const extension = kind === "video" ? "mp4" : "jpg";

  const form = new FormData();
  form.append("file", {
    uri: asset.uri,
    name: asset.fileName || `upload.${extension}`,
    type: asset.mimeType || (kind === "video" ? "video/mp4" : "image/jpeg"),
  });
  form.append("upload_preset", CLOUDINARY.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/${kind}/upload`,
    { method: "POST", body: form }
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Erro ao enviar mídia");
  }
  return { type: kind, url: data.secure_url };
}

// Miniatura de vídeo do Cloudinary: troca a extensão por .jpg
export function videoThumbnail(url) {
  return url.replace(/\.[^./]+$/, ".jpg");
}

export function ownerIdOf(item) {
  return String(
    typeof item.userId === "object" ? item.userId?._id : item.userId
  );
}
