# 🏙️ CidadeAlerta CE

> Plataforma digital de denúncias e acompanhamento de problemas urbanos no município de Horizonte – CE.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/Licença-MIT-blue)

---

## 📋 Sobre o Projeto

**CidadeAlerta CE** é uma plataforma híbrida (API REST + frontend web) que conecta cidadãos à prefeitura de Horizonte – CE, permitindo:

- 📍 Registro georreferenciado de ocorrências urbanas (buracos, iluminação, lixo, alagamentos)
- 🗺️ Mapa interativo com todas as ocorrências da cidade
- 🔄 Acompanhamento de status em tempo real
- 🔔 Notificações automáticas ao mudar o status
- 📊 Painel administrativo para a gestão municipal

---

## 👤 Integrante

| Nome | Matrícula | Função |
|------|-----------|--------|
| Leandro Gonçalves Nascimento | 2326350 | Desenvolvedor Backend |

**Disciplina:** Desafios do Ciberespaço  
**Prazo de entrega:** 05/06/2026

---

## 🏗️ Arquitetura

```
cidade-alerta/
├── backend/          # API REST — Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Lógica das rotas
│   │   ├── routes/        # Definição dos endpoints
│   │   ├── middleware/     # Auth, validação, rate limit
│   │   ├── services/      # Regras de negócio
│   │   ├── models/        # Tipos e interfaces
│   │   └── config/        # Configurações (DB, JWT, etc.)
│   └── prisma/            # Schema e migrations do banco
└── frontend/         # Interface Web — React + TypeScript + Tailwind
    └── src/
        ├── app/           # Páginas principais
        ├── components/    # Componentes reutilizáveis
        ├── hooks/         # Custom hooks
        ├── services/      # Chamadas à API
        └── types/         # Tipos compartilhados
```

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 20+ | Runtime |
| TypeScript | 5.5+ | Linguagem |
| Express | 4.x | Framework HTTP |
| Prisma | 5.x | ORM |
| PostgreSQL | 16 | Banco de dados |
| JWT | — | Autenticação |
| bcrypt | — | Hash de senhas |
| Zod | 3.x | Validação de schemas |
| express-rate-limit | — | Rate limiting |

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18+ | UI |
| TypeScript | 5.5+ | Linguagem |
| Tailwind CSS | 3.x | Estilização |
| React Router | 6.x | Roteamento |
| Axios | — | HTTP client |
| Leaflet.js | — | Mapas interativos |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/LeoRachits/Cidade_Conecta.git
cd Cidade_Conecta
```

### 2. Configure o Backend
```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais do banco
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Configure o Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Acesse
- **API:** http://localhost:3333
- **Frontend:** http://localhost:5173
- **Documentação da API:** http://localhost:3333/api/docs

---

## 📡 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/auth/refresh` | Renovar token |
| GET  | `/api/auth/me` | Perfil do usuário |

### Ocorrências
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET  | `/api/occurrences` | Listar todas |
| POST | `/api/occurrences` | Criar ocorrência |
| GET  | `/api/occurrences/:id` | Detalhes |
| PATCH | `/api/occurrences/:id/status` | Atualizar status (admin) |
| GET  | `/api/occurrences/map` | Ocorrências p/ mapa |

### Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET  | `/api/admin/dashboard` | Métricas do painel |
| GET  | `/api/admin/reports` | Relatório de ocorrências |

---

## 🔐 Segurança

- ✅ Autenticação via JWT com refresh token rotativo
- ✅ Senhas com bcrypt (salt 12)
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting: 100 req/min por IP
- ✅ Validação de inputs com Zod
- ✅ Proteção contra SQL Injection via Prisma
- ✅ CORS configurado
- ✅ Conformidade com LGPD

---

## 📄 Licença

MIT License — veja [LICENSE](./LICENSE) para detalhes.

---

*Projeto acadêmico — Disciplina Desafios do Ciberespaço — 2026*
