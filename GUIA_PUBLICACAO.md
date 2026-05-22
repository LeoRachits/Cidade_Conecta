# 📱 Guia de Publicação — CidadeAlerta CE

## Android (Play Store Gratuito) — Taxa única US$ 25

### 1. Pré-requisitos
```bash
# Instalar Expo CLI e EAS CLI
npm install -g expo-cli eas-cli

# Fazer login na conta Expo (criar em expo.dev — gratuito)
eas login
```

### 2. Configurar o projeto
```bash
cd mobile

# Inicializar EAS no projeto (pede para logar na Expo)
eas build:configure

# Isso gera o projectId no app.json automaticamente
```

### 3. Criar conta no Google Play Console
1. Acesse: **play.google.com/console**
2. Pague a taxa única de **US$ 25** (~R$ 130)
3. Preencha os dados da conta de desenvolvedor

### 4. Gerar o APK/AAB de produção
```bash
# Build para produção (gera .aab para Play Store)
eas build --platform android --profile production

# Aguarde ~10-20 minutos (processo na nuvem da Expo)
# Ao terminar, baixe o arquivo .aab gerado
```

### 5. Publicar na Play Store
1. No Play Console: **Criar aplicativo**
2. Nome: `CidadeAlerta CE`
3. Idioma padrão: Português (Brasil)
4. Tipo: Aplicativo | Gratuito
5. Vá em **Produção → Criar nova versão**
6. Faça upload do arquivo `.aab`
7. Preencha:
   - **Título**: CidadeAlerta CE
   - **Descrição curta**: Denuncie problemas urbanos em Horizonte-CE
   - **Descrição completa**: (use o texto abaixo)
   - **Capturas de tela**: tire 2-3 prints do app rodando
   - **Ícone**: 512x512 PNG (fundo #1A3560 com 🏙️)
8. **Política de privacidade**: obrigatório — suba em link público
9. Submeta para revisão → aprovação em 1-3 dias

### Descrição para Play Store
```
CidadeAlerta CE é o canal oficial de comunicação entre cidadãos 
e a Prefeitura de Horizonte – CE para registro e acompanhamento 
de problemas urbanos.

📸 Tire uma foto do problema
📍 Localize automaticamente com GPS
📋 Acompanhe o status em tempo real
🔔 Receba notificações de atualização
🗺️ Veja todas as ocorrências no mapa

Categorias: Vias/Buracos, Iluminação, Lixo Irregular, 
Alagamentos e outros problemas urbanos.

A Secretaria de Infraestrutura é notificada automaticamente 
ao registrar cada ocorrência.

Gratuito. Sem anúncios. Sem mensalidades.
```

---

## iOS (PWA — Sem Custo, Sem App Store)

### O que é PWA?
Progressive Web App = site que se comporta como app nativo.
O cidadão acessa pelo Safari e instala direto na tela inicial.

### 1. Configurar o frontend web como PWA

Adicionar ao `frontend/public/manifest.json`:
```json
{
  "name": "CidadeAlerta CE",
  "short_name": "CidadeAlerta",
  "description": "Denúncias urbanas — Horizonte CE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A3560",
  "theme_color": "#1A3560",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 2. Adicionar ao index.html
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="CidadeAlerta CE" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

### 3. Como o cidadão instala no iPhone
1. Abre o link no Safari: `https://cidadealerta.horizonte.ce.gov.br`
2. Toca em **Compartilhar** (ícone de seta)
3. Toca em **"Adicionar à Tela de Início"**
4. O app aparece como ícone nativo no iPhone ✅

---

## Deploy do Backend (Gratuito/Barato)

### Opção 1 — Railway.app (recomendado, ~US$ 5/mês)
```bash
# Instalar Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Opção 2 — Render.com (gratuito com limitações)
1. Acesse render.com
2. Novo Web Service → conecte o GitHub
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`
5. Configure as variáveis de ambiente no painel

### Opção 3 — VPS (DigitalOcean ~US$ 6/mês)
```bash
# No servidor Ubuntu:
git clone https://github.com/LeoRachits/Cidade_Conecta.git
cd Cidade_Conecta/backend
cp .env.example .env && nano .env  # configurar
npm install && npx prisma migrate deploy
npm run build && npm start

# Com PM2 para manter rodando:
npm install -g pm2
pm2 start dist/server.js --name cidade-alerta
pm2 save && pm2 startup
```

---

## Configurar E-mails da Prefeitura

No arquivo `.env` do backend:

```env
EMAIL_FROM="cidadealerta.ce@gmail.com"
EMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # senha de app do Google
EMAIL_PREFEITURA="prefeitura@horizonte.ce.gov.br"
EMAIL_INFRAESTRUTURA="infraestrutura@horizonte.ce.gov.br"
EMAIL_MEIO_AMBIENTE="meioambiente@horizonte.ce.gov.br"
```

**Para gerar a senha de app do Gmail:**
1. myaccount.google.com → Segurança
2. Verificação em duas etapas → Ative
3. Senhas de app → Outro → "CidadeAlerta CE"
4. Copie os 16 caracteres gerados

---

## Resumo de Custos

| Item | Custo |
|------|-------|
| Android (Play Store) | US$ 25 — uma única vez |
| iOS (PWA) | **Gratuito** |
| Backend (Railway) | ~US$ 5/mês |
| Domínio .gov.br | Gratuito (via Registro.br para prefeituras) |
| Gmail SMTP | **Gratuito** |
| **Total mínimo** | **US$ 25 + ~US$ 5/mês** |
