# ReVeste Kids Mobile

Aplicativo mobile do **ReVeste Kids**, uma plataforma de troca de roupas infantis. Cada peça aparece em tela cheia num feed vertical, no estilo TikTok. Quando duas pessoas curtem peças uma da outra, acontece um match e elas podem combinar a troca.

Este app foi desenvolvido em **React Native com Expo**. Ele é a versão mobile do projeto web [Ralky-Tech/reveste_kids](https://github.com/Ralky-Tech/reveste_kids), criado como Projeto Integrador do curso de Desenvolvimento de Software Multiplataforma (DSM) da Fatec Registro. O app usa o mesmo backend, o mesmo banco de dados e o mesmo serviço de mídia do site, então contas, peças e curtidas são compartilhadas entre as duas versões.

---

## Funcionalidades

### Autenticação
- Cadastro de usuário, com login automático em seguida
- Login com JWT
- Sessão salva com segurança no aparelho (`expo-secure-store`), que continua ativa ao reabrir o app
- Expiração do token verificada ao abrir o app
- Logout com confirmação

### Feed
- Uma peça por tela, com rolagem vertical paginada
- Carrossel horizontal quando a peça tem várias fotos ou vídeos
- Vídeos tocam sozinhos quando aparecem na tela e pausam ao sair dela
- Toque no vídeo para ligar ou desligar o som
- Curtir e descurtir, com contador de curtidas
- Aviso de **match** quando o interesse é mútuo
- As peças do próprio usuário não aparecem no feed
- Puxar para atualizar

### Cadastro de peças
- Fotos da galeria (várias de uma vez) ou tiradas na hora pela câmera
- Vídeo da galeria (até 60 segundos)
- Até 6 mídias por peça, com prévia e opção de remover cada uma
- Envio direto para o Cloudinary, com indicação de progresso
- Seleção de categoria, tamanho e estado da peça

### Meu Closet
- Grade com as peças do usuário, da mais recente para a mais antiga
- Miniatura automática para peças que só têm vídeo
- Exclusão de peças com confirmação (pelo ícone de lixeira ou segurando o card)
- Puxar para atualizar

### Visual
- Tema claro e escuro que acompanha a configuração do celular
- Mesma paleta de cores roxa do site

---

## Tecnologias

| Área | Tecnologia |
| --- | --- |
| Base | React Native 0.86, React 19.2, Expo SDK 57 |
| Navegação | React Navigation 7 (native stack + bottom tabs) |
| Vídeo | `expo-video` |
| Fotos e câmera | `expo-image-picker` |
| Armazenamento seguro | `expo-secure-store` |
| Ícones | `@expo/vector-icons` (Ionicons) |
| Upload de mídia | Cloudinary (upload não assinado) |
| Backend | API Node.js + Express + MongoDB Atlas, hospedada no Render |

---

## Estrutura do projeto

```
reveste-kids-mobile/
│
├── App.js                      # Navegação: telas de login ou abas do app
├── assets/
│   └── logo.png
└── src/
    ├── config.js               # Endereço do backend e dados do Cloudinary
    ├── api.js                  # Requisições à API e upload no Cloudinary
    ├── AuthContext.js          # Login, cadastro, logout e sessão salva
    ├── jwt.js                  # Leitura dos dados do token JWT
    ├── theme.js                # Cores dos temas claro e escuro
    ├── components/
    │   ├── MediaCarousel.js    # Carrossel de fotos e vídeos
    │   └── ui.js               # Botão, campo de texto, chip e mensagem
    └── screens/
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── FeedScreen.js
        ├── AddClothingScreen.js
        └── MyClosetScreen.js
```

---

## Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado no computador (versão LTS)
- App **Expo Go** atualizado no celular (Play Store ou App Store)
- Celular e computador na **mesma rede Wi-Fi**

### 1. Clonar o repositório
```
git clone https://github.com/ricardosugano/reveste-kids-mobile.git
```

### 2. Entrar na pasta
```
cd reveste-kids-mobile
```

### 3. Instalar as dependências
```
npm install
```

### 4. Conferir o endereço do backend
No arquivo `src/config.js`:

```js
export const API_URL = "https://reveste-kids-backend.onrender.com";
```

Para usar um backend rodando no próprio computador, troque pelo IP do computador na rede Wi-Fi, por exemplo `http://192.168.0.15:4000`. O endereço `localhost` não funciona no celular.

### 5. Iniciar o app
```
npx expo start
```

Depois, escaneie o QR Code que aparece no terminal:
- **Android:** pelo app Expo Go, na opção "Scan QR code"
- **iPhone:** pela câmera do celular

### Problemas comuns

| Mensagem | Solução |
| --- | --- |
| *Project is incompatible with this version of Expo Go* | Atualize o Expo Go na loja de aplicativos. |
| *Cannot connect to Expo CLI* | Confira se o terminal com o `npx expo start` continua aberto e se o celular está no mesmo Wi-Fi. Libere o **Node.js** no Firewall do Windows. |
| A rede não deixa conectar (faculdade, trabalho) | Rode `npm install @expo/ngrok --save-dev` e depois `npx expo start --tunnel`. |
| *No Android connected device found* | O comando `npm run android` exige emulador ou cabo USB. Use `npx expo start` com o Expo Go. |
| O primeiro login demora | O plano gratuito do Render desliga o servidor sem uso. A primeira requisição pode levar cerca de 50 segundos. |

---

## Rotas da API utilizadas

| Método | Rota | Uso no app |
| --- | --- | --- |
| `POST` | `/user` | Cadastro |
| `POST` | `/auth` | Login (retorna o token JWT) |
| `GET` | `/clothes` | Peças do feed |
| `GET` | `/my-clothes` | Peças do Meu Closet |
| `POST` | `/clothes` | Cadastro de peça |
| `DELETE` | `/clothes/:id` | Exclusão de peça |
| `GET` | `/api/my-likes` | Peças já curtidas pelo usuário |
| `POST` | `/api/like/:clothingId` | Curtir (pode gerar match) |
| `DELETE` | `/api/like/:clothingId` | Descurtir |

As rotas protegidas recebem o token no cabeçalho `Authorization: Bearer <token>`.

---

## Observação sobre o backend

O app envia **categoria**, **tamanho** e **estado** junto com cada peça, assim como o formulário do site. Porém, o modelo `Clothing` do backend ainda não tem esses campos, e por isso o MongoDB descarta essas informações. Para que elas sejam salvas, basta adicionar ao schema em `backend/models/Clothing.js`:

```js
size: { type: String, default: "" },
category: { type: String, default: "" },
condition: { type: String, default: "" },
```

---

## Próximos passos

- [ ] Tela de Matches com chat em tempo real (Socket.IO)
- [ ] Central de notificações
- [ ] Busca de closets públicos
- [ ] Edição de peças
- [ ] Filtro Inteligente de Peças (tipo, tamanho, cor, material e estado)
- [ ] Geração de APK para instalar sem o Expo Go

---

## Créditos

App mobile desenvolvido por **Ricardo Sugano**.

O projeto web e o backend do ReVeste Kids foram desenvolvidos pela equipe Ralky Tech: Camila Machado de Souza, Felipe Guedes, Kaio Sumikawa, Ricardo Sugano e Rogerio Pupo Toledo.

---

## Licença

Projeto acadêmico, sem fins comerciais.
