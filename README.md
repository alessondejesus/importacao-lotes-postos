# Importação de Lotes - Postos

Este projeto consiste em um sistema de importação e exportação de lotes para postos de combustíveis, composto por um backend Node.js (Express + PostgreSQL) e um frontend Vue.js (Vuetify).

## 🚀 Como Rodar o Projeto

A forma mais simples e rápida de rodar o projeto localmente é utilizando o Docker. Não é necessário configurar nada manualmente, as credenciais padrão já estão configuradas para o ambiente de desenvolvimento.

### Pré-requisitos

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd importacao-lotes-postos
   ```

2. **Suba os containers:**
   ```bash
   docker-compose up --build
   ```

3. **Acesse as aplicações:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend:** [http://localhost:3000](http://localhost:3000)

## 🛠️ Tecnologias e Versões

- **Node.js:** v24 (slim)
- **PostgreSQL:** v17 (alpine)
- **Backend:** Express, TypeScript, tsx (watch mode)
- **Frontend:** Vue 3, Vuetify, Vite
- **Docker & Docker Compose**

## 🧪 Testes

O projeto possui testes automatizados no backend utilizando **Jest**.

### Como rodar os testes:

**Via Docker (recomendado):**
```bash
docker-compose exec backend npm run test
```

**Localmente (necessário `npm install` na pasta `backend`):**
```bash
cd backend
npm run test
```

## 🏗️ Serviços (Docker Compose)

O projeto é orquestrado em 3 serviços principais:

- **db**: Banco de dados PostgreSQL (v17).
- **backend**: API Node.js rodando em `localhost:3000`.
- **frontend**: Interface Vuetify rodando em `localhost:5173`.

## 🔐 Configurações e Credenciais

O projeto já vem pré-configurado para rodar "fora da caixa". As variáveis de ambiente são injetadas diretamente via `docker-compose.yml`.

### Credenciais Padrão do Banco (Ambiente Docker):
- **Host:** `db`
- **Porta:** `5432`
- **Usuário:** `user`
- **Senha:** `password`
- **Database:** `gasstation`

### Variáveis de Ambiente (.env)
Se você preferir rodar o projeto sem Docker, precisará criar um arquivo `.env` na pasta `backend/` seguindo o modelo acima. No Docker, o arquivo `docker-compose.yml` já cuida dessa configuração automaticamente.

## 📁 Desenvolvimento com Live Reload
Os volumes estão configurados no Docker Compose para que qualquer alteração feita no código local (nas pastas `backend/` ou `frontend/`) seja refletida instantaneamente dentro dos containers, facilitando o desenvolvimento.

## 🗄️ Migrations
As migrations do banco de dados são executadas automaticamente sempre que o container do `backend` inicia (via Docker). Elas verificam a pasta `backend/src/database/migrations` e aplicam os arquivos `.sql` que ainda não foram executados.

Se precisar rodar manualmente por algum motivo, você ainda pode usar:
```bash
docker-compose exec backend npm run migrate
```