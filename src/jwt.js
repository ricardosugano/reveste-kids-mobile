// Lê os dados (id, email, role) de dentro do token JWT,
// igual ao que o site faz com atob() no AuthPanel.jsx
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64Decode(input) {
  const str = input.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const c of str) {
    const value = CHARS.indexOf(c);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
      buffer &= (1 << bits) - 1;
    }
  }
  return output;
}

export function decodeJwt(token) {
  try {
    const raw = base64Decode(token.split(".")[1]);
    const json = decodeURIComponent(
      raw
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
