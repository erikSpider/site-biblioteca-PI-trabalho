# 📚 Biblioteca Flow

Sistema web de gerenciamento de biblioteca, desenvolvido como Projeto Integrador. Permite cadastrar e consultar **autores**, **livros**, **clientes** e **alocações (locações)**, com um painel inicial (dashboard) e busca global.

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![json-server](https://img.shields.io/badge/json--server-0.17-black)

## 📸 Demonstração

<!-- Adicione prints em docs/screenshots/ e troque os caminhos abaixo -->
![Login](docs/screenshots/login.png)
![Dashboard](docs/screenshots/dashboard.png)

## ✨ Funcionalidades

- [x] Tela de login (simulada, apenas para demonstração)
- [x] Dashboard com visão geral do acervo
- [x] CRUD de autores, livros, clientes e alocações
- [x] Busca global entre as entidades
- [x] Layout responsivo com menu mobile

## 🧱 Tecnologias

- **Front-end:** Angular 19 (componentes standalone), TypeScript, Bootstrap 5, RxJS
- **API fake:** json-server (dados em `backend/db.json`)
- **Testes:** Karma + Jasmine

## ▶️ Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/erikSpider/site-biblioteca-PI-vis.git
cd site-biblioteca-PI-vis

# 2. Instalar as dependências
npm install

# 3. Subir a API fake (terminal 1) - porta 3000
npx json-server --watch backend/db.json --port 3000

# 4. Subir o front-end (terminal 2) - porta 4200
npm start
```

Acesse **http://localhost:4200**.

> A tela de login é simulada. Use o botão de acesso demo ou qualquer usuário com 3+ caracteres e senha com 4+ caracteres.

## 🗂️ Estrutura

```
src/app/
├── components/   # home, login, autores, livros, clientes, locacoes
├── models/       # interfaces (Autor, Livro, Cliente, Locacao)
└── services/     # acesso à API (HttpClient)
backend/db.json   # dados de exemplo da API
```

## 🧪 Testes

```bash
npm test
```

## 🗺️ Próximos passos

- [ ] Trocar o json-server por uma API real (Java + Spring Boot + banco de dados)
- [ ] Autenticação de verdade (JWT)
- [ ] Roteamento com Angular Router
- [ ] Deploy

## 👤 Autor

**Erik Davi** · [GitHub](https://github.com/erikSpider) · [LinkedIn](https://www.linkedin.com/in/erik-davi-111127235)
