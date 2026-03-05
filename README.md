# Import Export Frontend

Aplicação frontend moderna para gerenciamento de importação e exportação massiva de usuários via CSV, com dashboard em tempo real, monitoramento de filas e health check, construída com Vue 3 e TypeScript.

## Funcionalidades

- Autenticação JWT (login, registro, logout, refresh automático)
- Dashboard com métricas em tempo real (imports, exports, filas, saúde)
- CRUD de usuários com filtros, paginação e ordenação
- Upload de CSV com drag-and-drop e validação de formato
- Acompanhamento de importações em tempo real com barra de progresso
- Exportação assíncrona com preview de contagem e filtros dinâmicos
- Download de arquivos exportados (CSV / CSV comprimido)
- Reprocessamento e exclusão de imports/exports com falha
- Página de health check com status de serviços e latência
- Notificações toast para feedback de ações
- Layout responsivo com sidebar e header modernos
- Polling automático para atualização de status

## Stack

| Camada           | Tecnologia                       |
|------------------|----------------------------------|
| Framework        | Vue 3 (Composition API)          |
| Linguagem        | TypeScript 5.9                   |
| Build            | Vite 7                           |
| CSS              | Tailwind CSS 4                   |
| Estado           | Pinia 3                          |
| Roteamento       | Vue Router 4                     |
| HTTP             | Axios                            |
| Validação        | Zod 4                            |
| Gráficos         | Chart.js + vue-chartjs           |
| Utilitários      | VueUse                           |
| Testes           | Vitest + Vue Test Utils          |
| Linting          | ESLint + Prettier                |
| Containers       | Docker Compose                   |

## Requisitos

- Node.js 22+ (ou Docker)
- Backend [Import-Export-API-Project](../Import-Export-API-Project) rodando

## Instalação

### Com Docker (recomendado)

```bash
git clone <url-do-repositorio>
cd Import-Export-Front-Project

# Iniciar em modo desenvolvimento com hot-reload
docker compose up -d
```

A aplicação estará disponível em `http://localhost:5174`.

### Sem Docker

```bash
git clone <url-do-repositorio>
cd Import-Export-Front-Project

npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5174`.

## Serviços

| Serviço       | URL / Porta           | Descrição                                |
|---------------|-----------------------|------------------------------------------|
| Dev Server    | http://localhost:5174  | Vite com hot-reload                      |
| Produção      | http://localhost:3001  | Nginx servindo build otimizado (profile `prod`) |

## Credenciais Padrão

O backend fornece 3 usuários pré-cadastrados via seeder:

| Perfil    | E-mail                | Senha      |
|-----------|-----------------------|------------|
| Admin     | `admin@example.com`   | `password` |
| Manager   | `manager@example.com` | `password` |
| Usuário   | `user@example.com`    | `password` |

---

## Páginas

### Login e Registro

- Layout split-screen com sidebar informativa em telas grandes
- Validação de formulário em tempo real com mensagens de erro
- Redirect automático para dashboard após autenticação
- Guard de rota: redireciona para login se não autenticado

### Dashboard

- Métricas resumidas: total de usuários, imports, exports, status de saúde
- Importações e exportações recentes com status em badge colorido
- Status das filas (default, imports, exports) com indicadores visuais
- Polling automático para atualização em tempo real

### Usuários

- Listagem paginada com busca por nome/e-mail
- Filtros por role (Admin, Manager, Usuário) e estado (UF)
- Ordenação por nome, e-mail ou data de criação
- Criação e edição com validação completa
- Exclusão com confirmação via modal

### Importações

- Upload de CSV via drag-and-drop ou seleção de arquivo
- Validação de formato (apenas `.csv`) e tamanho máximo
- Listagem com filtro por status e paginação
- Página de detalhes com:
  - Barra de progresso em tempo real
  - Contadores de sucesso e falhas
  - Estimativa de tempo restante
  - Mensagem de erro (se houver)
- Botões de reprocessar e excluir para imports com falha

### Exportações

- Modal de criação com filtros dinâmicos (busca, role, estado, cidade)
- Preview em tempo real: mostra quantos registros serão exportados
- Atualização debounced (400ms) conforme filtros são ajustados
- Botão desabilitado quando não há registros para exportar
- Opção de compressão (gzip)
- Download direto do arquivo ao concluir
- Botões de reprocessar e excluir para exports com falha

### Health Check

- Status visual de cada serviço (Database, Redis, Storage)
- Latência por serviço em milissegundos
- Métricas brutas do Prometheus
- Auto-refresh a cada 30 segundos

---

## Arquitetura

O projeto segue uma **arquitetura modular** com separação clara de responsabilidades:

```
src/
├── assets/
│   └── css/
│       └── main.css            → Tailwind CSS v4 com @theme customizado
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue       → Layout principal (sidebar + header + content)
│   │   ├── AppHeader.vue       → Header com info do usuário e logout
│   │   ├── AppSidebar.vue      → Navegação lateral com ícones SVG
│   │   └── AppNotifications.vue → Toast notifications
│   └── ui/
│       ├── AppButton.vue       → Botão com variantes (primary, danger, outline, ghost)
│       ├── AppInput.vue        → Input com label, erro e validação
│       ├── AppSelect.vue       → Select dropdown
│       ├── AppCard.vue         → Card com título e slot
│       ├── AppModal.vue        → Modal com backdrop blur e transição
│       ├── AppBadge.vue        → Badge de status com dot colorido
│       ├── AppAlert.vue        → Alerta informativo/erro
│       ├── AppProgressBar.vue  → Barra de progresso com gradiente
│       ├── AppPagination.vue   → Paginação numérica
│       ├── AppFileUpload.vue   → Upload com drag-and-drop
│       └── AppLogo.vue         → Logo da aplicação
├── composables/
│   ├── useFormValidation.ts    → Validação reativa de formulários
│   └── usePolling.ts           → Polling automático com intervalo configurável
├── lib/
│   └── api.ts                  → Instância Axios com interceptors (JWT, refresh, errors)
├── pages/
│   ├── auth/                   → LoginPage, RegisterPage
│   ├── dashboard/              → DashboardPage
│   ├── users/                  → UsersListPage, CreateUserPage, EditUserPage
│   ├── imports/                → ImportsListPage, ImportDetailPage
│   ├── exports/                → ExportsListPage, ExportDetailPage
│   └── health/                 → HealthPage
├── router/
│   └── index.ts                → Vue Router com guards de autenticação
├── schemas/
│   ├── auth.ts                 → Zod schemas para login/registro
│   ├── user.ts                 → Zod schemas para CRUD de usuários
│   ├── import.ts               → Zod schemas para importações
│   └── export.ts               → Zod schemas para exportações
├── services/
│   ├── authService.ts          → Chamadas HTTP para /auth/*
│   ├── userService.ts          → Chamadas HTTP para /users/*
│   ├── importService.ts        → Chamadas HTTP para /imports/*
│   ├── exportService.ts        → Chamadas HTTP para /exports/*
│   └── healthService.ts        → Chamadas HTTP para /health, /metrics
├── stores/
│   ├── auth.ts                 → Estado de autenticação (token, user, login, logout)
│   ├── user.ts                 → Estado de usuários (lista, CRUD, filtros)
│   ├── import.ts               → Estado de importações (lista, upload, progresso)
│   ├── export.ts               → Estado de exportações (lista, criação, download)
│   ├── notification.ts         → Estado de notificações toast
│   └── health.ts               → Estado de health check e métricas
├── types/
│   └── index.ts                → Interfaces TypeScript (User, Import, Export, etc.)
├── App.vue                     → Componente raiz
└── main.ts                     → Entry point (Vue, Pinia, Router, CSS)
```

### Fluxo de dados

```
Página → Store (Pinia) → Service (Axios) → API Backend
                ↓
           Componentes UI (reatividade Vue)
```

### Padrões aplicados

| Padrão                  | Implementação                                              |
|-------------------------|------------------------------------------------------------|
| Composition API         | `<script setup>` com composables reutilizáveis             |
| State Management        | Pinia stores com tipagem forte                             |
| Schemas / DTOs          | Zod para validação em runtime de dados da API              |
| Service Layer           | Services encapsulam chamadas HTTP (1 service por módulo)   |
| Interceptors            | Axios interceptors para JWT, refresh e tratamento de erros |
| Route Guards            | Proteção de rotas autenticadas e redirecionamento de guest |
| Lazy Loading            | Todas as páginas são carregadas sob demanda                |
| Debounce                | Filtros de exportação com atualização debounced (400ms)    |
| Polling                 | Composable `usePolling` para atualização periódica de status |
| Responsive Design       | Layout adapta-se a mobile, tablet e desktop                |

---

## Design System

### Tema de cores

A paleta primária utiliza tons de azul, configurada via Tailwind CSS v4 `@theme`:

| Token              | Cor       | Uso                                    |
|--------------------|-----------|----------------------------------------|
| `primary-50`       | `#eff6ff` | Backgrounds sutis                      |
| `primary-500`      | `#3b82f6` | Cor principal (botões, links, badges)  |
| `primary-600`      | `#2563eb` | Hover e estados ativos                 |
| `primary-900`      | `#1e3a5f` | Textos sobre fundo claro              |
| `primary-950`      | `#0f172a` | Sidebar e elementos escuros           |
| `success-500`      | `#22c55e` | Status de sucesso                      |
| `danger-500`       | `#ef4444` | Erros e ações destrutivas             |
| `warning-500`      | `#f59e0b` | Alertas e status de processamento     |
| `info-500`         | `#0ea5e9` | Informações e status em fila          |

### Componentes UI

Todos os componentes UI seguem um padrão consistente:
- Props tipadas com valores padrão sensatos
- Variantes via props (`variant`, `size`)
- Slots para composição flexível
- `cursor: pointer` global em elementos clicáveis
- Transições e animações suaves
- Focus rings acessíveis

---

## Proxy da API

O Vite dev server faz proxy de todas as chamadas `/api` para o backend:

| Ambiente    | Target                              |
|-------------|-------------------------------------|
| Local       | `http://localhost:8080`             |
| Docker      | `http://import-export-nginx:80`     |

Configurado via variável de ambiente `API_PROXY_TARGET` no `docker-compose.yml`.

---

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes uma vez (sem watch)
npm run test:run

# Rodar com cobertura
npm run test:coverage
```

### Cobertura de testes

| Camada       | Arquivos testados                                    |
|--------------|------------------------------------------------------|
| Services     | `authService.test.ts`                                |
| Stores       | `auth.test.ts`, `user.test.ts`, `import.test.ts`, `notification.test.ts` |
| Composables  | `useFormValidation.test.ts`, `usePolling.test.ts`    |

---

## Scripts npm

| Script           | Descrição                                    |
|------------------|----------------------------------------------|
| `npm run dev`    | Inicia dev server com hot-reload (porta 5174)|
| `npm run build`  | Build de produção (TypeScript + Vite)        |
| `npm run preview`| Preview do build de produção                 |
| `npm test`       | Roda testes com Vitest (watch mode)          |
| `npm run test:run` | Roda testes uma vez                        |
| `npm run test:coverage` | Testes com relatório de cobertura     |
| `npm run lint`   | ESLint com auto-fix                          |
| `npm run format` | Prettier em todos os arquivos de `src/`      |

## Qualidade de Código

```bash
# Linting (ESLint)
npm run lint

# Formatação (Prettier)
npm run format

# Type checking (TypeScript)
npx vue-tsc --noEmit
```

## Estrutura Docker

```
.docker/
├── Dockerfile              → Multi-stage build (Node 22 Alpine → Nginx Alpine)
└── nginx/
    └── default.conf        → Virtual host com SPA fallback (try_files)
```

### docker-compose.yml

| Serviço     | Imagem          | Porta | Descrição                          |
|-------------|-----------------|-------|------------------------------------|
| `dev`       | node:22-alpine  | 5174  | Dev server com hot-reload e proxy  |
| `frontend`  | nginx:alpine    | 3001  | Build de produção (profile `prod`) |

### Rede Docker

O container de desenvolvimento se conecta à rede externa `import-export-api-project_app-network`, permitindo comunicação direta com o backend via `http://import-export-nginx:80`.

```bash
# Desenvolvimento (padrão)
docker compose up -d

# Produção
docker compose --profile prod up -d
```

## Variáveis de Ambiente

| Variável            | Descrição                                | Valor Padrão                  |
|---------------------|------------------------------------------|-------------------------------|
| `VITE_API_URL`      | URL base da API (usado no frontend)      | `http://localhost:8080`       |
| `API_PROXY_TARGET`  | Target do proxy Vite (usado no servidor) | `http://localhost:8080`       |

## Integração com o Backend

Este frontend foi projetado para funcionar com o [Import-Export-API-Project](../Import-Export-API-Project). Para o ambiente funcionar corretamente:

1. Inicie o backend primeiro: `cd ../Import-Export-API-Project && docker compose up -d`
2. Verifique que a API está acessível em `http://localhost:8080/api/v1/health`
3. Inicie o frontend: `cd ../Import-Export-Front-Project && docker compose up -d`
4. Acesse `http://localhost:5174` e faça login com as credenciais padrão
