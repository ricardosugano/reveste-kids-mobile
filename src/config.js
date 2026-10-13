// ============================================================
// CONFIGURAÇÃO DO APP — este é o único arquivo que você precisa editar
// ============================================================

// Endereço do backend.
// - Use o endereço do backend no Render (ex.: "https://reveste-kids-api.onrender.com")
// - OU, para testar com o backend rodando no seu computador, use o IP do
//   computador na rede Wi-Fi (ex.: "http://192.168.0.15:4000").
//   ATENÇÃO: "localhost" NÃO funciona no celular.
// Não coloque barra "/" no final.
export const API_URL = "https://reveste-kids-backend.onrender.com";

// Mesmos dados de upload que o site usa (AddClothing.jsx)
export const CLOUDINARY = {
  cloudName: "djgu3sdab",
  uploadPreset: "reveste_kids_upload",
};
