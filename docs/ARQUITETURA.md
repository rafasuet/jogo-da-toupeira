# Arquitetura — Acerte a Toupeira (SI401)

Este documento descreve como o projeto está organizado e **por quê**. Leia antes de
criar arquivos novos: se algo não tem lugar claro aqui, discuta com o grupo antes.

## 1. Visão geral

```
 Navegador                                   Servidor (Apache + PHP + MySQL)
┌────────────────────────────────────┐      ┌─────────────────────────────────────┐
│ páginas (HTML/PHP) + CSS externo   │      │ api/*.php        (endpoints JSON)   │
│                                    │ HTTP │   └─ src/Services   (regras)        │
│ assets/js/pages   (orquestra)      │─────▶│        └─ src/Repositories (SQL)    │
│   ├─ ui/          (DOM)            │ JSON │             └─ src/Core/Database    │
│   ├─ game/        (regras, sem DOM)│◀─────│                    (PDO)            │
│   └─ data/        (persistência)   │      │ src/Core/Session (sessões PHP)      │
└────────────────────────────────────┘      └─────────────────────────────────────┘
```

Princípios que guiam tudo:

1. **Separação de responsabilidades** — regra de jogo não toca no DOM; SQL só existe em
   repositórios; endpoints não têm regra de negócio.
2. **Dependências apontam para dentro** — `ui` e `pages` dependem de `game`; `game` não
   depende de ninguém. No PHP: `api → Services → Repositories → Core`.
3. **Trocar implementação sem reescrever** — a persistência de partidas é uma interface
   (`MatchRepository`) com duas implementações: `LocalMatchRepository` (Parcial 2) e
   `ApiMatchRepository` (Parcial 3).
4. **Configuração em um lugar só** — parâmetros do jogo em `assets/js/game/constants.js`;
   credenciais do banco em `src/config/config.php`.

## 2. Estrutura de diretórios

```
/
├── index.html            Login (página inicial)          ─┐
├── cadastro.html         Cadastro de jogador              │ Parcial 3: viram .php
├── jogo.html             Jogo + HUD + histórico           │ (ver seção 7)
├── ranking.html          Ranking global                   │
├── perfil.html           Edição de dados pessoais        ─┘
│
├── assets/
│   ├── css/
│   │   ├── base.css         variáveis (cores, espaçamentos), reset, tipografia
│   │   ├── layout.css       header, navegação, main, footer
│   │   ├── components.css   botões, formulários, tabelas, cards, mensagens
│   │   └── pages/           estilos exclusivos de uma página
│   ├── img/                 toupeira, bomba, buraco, martelo (cursor)
│   └── js/
│       ├── game/            DOMÍNIO — lógica pura do jogo (sem DOM)
│       ├── ui/              VIEWS — renderizam estado e capturam cliques
│       ├── data/            PERSISTÊNCIA — repositórios e cliente HTTP
│       ├── utils/           validação (CPF, e-mail, telefone) e formatação
│       └── pages/           PONTO DE ENTRADA de cada página (1 arquivo por página)
│
├── api/                  Endpoints JSON (Parcial 3) — controladores finos
│   ├── auth/             login.php, logout.php, register.php
│   ├── matches.php       GET histórico do usuário | POST salvar partida
│   ├── ranking.php       GET ranking por modalidade
│   └── profile.php       GET dados do usuário | POST atualizar
│
├── src/                  Código PHP interno (NÃO acessível via URL — .htaccess)
│   ├── bootstrap.php     carrega config, autoload simples, inicia sessão
│   ├── config/           config.example.php (versionado) → config.php (local)
│   ├── Core/             Database (PDO), Session, Request, JsonResponse
│   ├── Repositories/     UserRepository, MatchRepository (único lugar com SQL)
│   ├── Services/         AuthService, UserService, MatchService, RankingService
│   └── Validation/       UserValidator, MatchValidator
│
├── database/             (NÃO acessível via URL — .htaccess)
│   ├── schema.sql        DDL das tabelas
│   └── setup.php         script de criação das tabelas (entregável obrigatório)
│
└── docs/
    ├── ARQUITETURA.md    este arquivo
    ├── REGRAS-DO-JOGO.md parâmetros definidos pelo grupo (t, x, tt, bombas, ranking)
    └── INSTRUCOES.txt    instruções de instalação/uso + link do vídeo (entregável)
```

## 3. Navegação entre páginas

```
                ┌──────────── "Cadastre-se" ────────────┐
                ▼                                       │
          cadastro.html ── "Criar conta" / "Entrar" ──▶ index.html (login)
                                                        │ "Entrar"
                                                        ▼
        ┌──────────────── menu comum (Jogar · Ranking · Meu perfil · Sair) ───────────────┐
        │                                                                                 │
   jogo.html  ◀──────────▶  ranking.html  ◀──────────▶  perfil.html                "Sair" → index.html
   (configuração, placar,                                ("Cancelar" → jogo.html)
    tabuleiro, histórico)
```

- **Páginas públicas:** apenas `index.html` e `cadastro.html` (sem menu).
- **Páginas autenticadas:** `jogo.html`, `ranking.html` e `perfil.html` compartilham o mesmo
  cabeçalho, com o link da página atual destacado (`aria-current="page"`).
- **Configuração e partida na mesma página:** o jogador escolhe tabuleiro e modalidade ao lado
  do tabuleiro. Ao desistir ou perder, a partida entra no histórico logo abaixo, e um diálogo
  (`<dialog>`) pergunta se ele quer jogar novamente. Isso evita trocar de página a cada partida.

## 4. Front-end (JavaScript)

Todo JS é **ES Module** (`<script type="module" src="...">`), sem bundler. Cada página
carrega **um único** arquivo de `pages/`, que importa o resto.

> ⚠️ Módulos ES não funcionam abrindo o HTML por `file://`. Sempre rode por um servidor
> local (XAMPP, `php -S localhost:8000` ou Live Server do VS Code). Isso deve constar no
> `INSTRUCOES.txt` de todas as parciais.

### 4.1 `game/` — domínio (lógica pura)

Nenhum arquivo aqui usa `document`, `window` ou `localStorage`. Isso permite testar a
lógica isoladamente e mantém a regra de negócio legível.

| Arquivo              | Responsabilidade |
|----------------------|------------------|
| `constants.js`       | Parâmetros do jogo (t, x, tt inicial, fator de redução, pausa entre níveis, limites do tabuleiro, prob. de bomba). |
| `Board.js`           | Dimensões (linhas × colunas), validação 4–64 buracos, sorteio de buraco livre. |
| `DifficultyPolicy.js`| Calcula `tt` (tempo visível) e intervalo de surgimento para um nível. |
| `GameMode.js`        | **Strategy**: `ClassicMode` e `ExplosiveMode`. Decide o que surge (toupeira/bomba) e o efeito do clique no placar. |
| `LevelStats.js`      | Contadores do nível atual: exibidas, acertadas, bombas; % de acerto; aprovado? |
| `Timer.js`           | Encapsula `setInterval`/`setTimeout` (agendar, cancelar um, cancelar tudo). |
| `GameEngine.js`      | Máquina de estados da partida (`idle → running → levelTransition → finished`). Emite eventos; não desenha nada. |

**Comunicação domínio → UI por eventos** (Observer). O `GameEngine` expõe `on(evento, fn)`
(devolve a função que remove o ouvinte). Todo payload traz também `snapshot`, o estado
completo do placar (`getSnapshot()`), para a UI só precisar redesenhar:

| Evento          | Payload (resumo) |
|-----------------|------------------|
| `levelStart`    | nível que começou (inclusive o 1), `visibleMs` (tt do nível) |
| `tick`          | — (tempo restante está no `snapshot`; a cada `LEVEL.TICK_MS`) |
| `spawn`         | índice do buraco, tipo (`mole`/`bomb`), `visibleMs` |
| `hide`          | índice do buraco, motivo (`timeout`/`hit`/`levelEnd`) |
| `hit`           | índice, tipo, pontos do clique (+1 ou −1) |
| `levelComplete` | nível aprovado e o próximo (começa após `LEVEL.TRANSITION_MS`) |
| `gameOver`      | `MatchResult` (ver 4.4), motivo (`defeat`/`quit`) |

O engine recebe `timer`, `clock` e `random` opcionais no construtor: em testes dá para
passar um relógio falso e simular uma partida inteira sem esperar o tempo real.

### 4.2 `ui/` — views

Recebem elementos do DOM no construtor e só fazem duas coisas: **renderizar** o que
recebem e **repassar** interações via callback. Não guardam regra de jogo.

`BoardView` (grade de buracos), `HudView` (tempo, modalidade, acertos, % nível, % necessária),
`HistoryView` (tabela de partidas), `RankingView` (tabelas do ranking), `FormView`
(mensagens de erro de formulário).

### 4.3 `pages/` — orquestração

Ex.: `pages/jogo.js` cria `GameEngine`, `BoardView`, `HudView`, liga eventos do engine às
views, e ao `gameOver` chama `matchRepository.save(result)` e pergunta se o usuário quer
jogar de novo.

### 4.4 `data/` — persistência

```js
// Contrato (duck typing — JS não tem interface):
// save(matchResult): Promise<void>
// listByCurrentUser(): Promise<MatchResult[]>
```

- `LocalMatchRepository` — `localStorage` (Parcial 2, sem back-end).
- `ApiMatchRepository` — `fetch` em `api/matches.php` via `httpClient.js` (Parcial 3).
- `index.js` exporta **qual** implementação usar → trocar de parcial = mudar 1 linha.

`MatchResult`: `{ rows, cols, mode, score, molesHit, bombsHit, levelReached, endReason, playedAt }`
(`playedAt` em ISO 8601). `listByCurrentUser()` devolve cada partida com `playerName` a mais,
para o histórico: no `LocalMatchRepository` vem do jogador de demonstração (`DEMO_PLAYER`,
o mesmo do cabeçalho), pois a Parcial 2 não tem login; na Parcial 3 vem do `JOIN users`.

## 5. Back-end (PHP, sem framework)

### 5.1 Camadas

| Camada           | Pode fazer | Não pode fazer |
|------------------|-----------|----------------|
| `api/*.php`      | Ler request, chamar service, devolver JSON, checar sessão | SQL, regra de negócio |
| `Services/`      | Regras (hash de senha, validação, montar ranking) | Ler `$_POST`, `echo` |
| `Repositories/`  | SQL com **prepared statements** (PDO) | Regra de negócio |
| `Core/`          | Infraestrutura (conexão, sessão, resposta JSON) | Conhecer entidades do jogo |

Fluxo típico (`POST api/matches.php`):
`Session::requireAuth()` → `Request::json()` → `MatchValidator` → `MatchService::save()` →
`MatchRepository::insert()` → `JsonResponse::created()`.

### 5.2 Segurança (mínimo obrigatório)

- Senhas com `password_hash()` / `password_verify()` — nunca texto puro.
- **Todo** SQL via prepared statements (`PDO::prepare`), nunca concatenação.
- `session_regenerate_id(true)` após login; `session_destroy()` no logout.
- Toda página protegida e todo endpoint (exceto login/cadastro) chamam `Session::requireAuth()`.
- Saída em HTML sempre com `htmlspecialchars()`; no JS, preencher com `textContent`, não `innerHTML`.
- `src/` e `database/` bloqueados por `.htaccess`; `config.php` fora do versionamento.
- Campos imutáveis (data de nascimento, CPF, username) **ignorados** no update pelo
  servidor — não basta desabilitar no formulário.

### 5.3 Banco de dados

Ver `database/schema.sql`. Duas tabelas:

- `users` — dados cadastrais; `username` e `cpf` únicos; `password_hash`.
- `matches` — uma linha por partida (incluindo desistências), FK para `users`.

O nome do jogador exibido no histórico vem de `JOIN users` (não é duplicado em `matches`).

## 6. Convenções de código

- **Idioma**: identificadores de código, arquivos JS/PHP e tabelas em **inglês**; textos
  exibidos ao usuário, nomes das páginas (URLs) e documentação em **português**.
- JS: `camelCase` para funções/variáveis, `PascalCase` para classes (1 classe por arquivo,
  arquivo com o nome da classe), `UPPER_SNAKE_CASE` para constantes.
- PHP: `PascalCase` para classes, `camelCase` para métodos, `declare(strict_types=1);` no topo.
- SQL: `snake_case`.
- CSS: classes em `kebab-case`, padrão BEM leve (`.board`, `.board__hole`, `.board__hole--active`).
  Sem `style=""` inline e sem IDs para estilizar.
- HTML: HTML5 semântico (`header`, `nav`, `main`, `section`, `table` com `thead/tbody`),
  `lang="pt-BR"`, `label` associado a todo `input`. Validar no W3C antes de cada entrega.
- Nada de números mágicos: valores do jogo vêm de `constants.js`.

## 7. Evolução por parcial

| Parcial | O que muda na estrutura |
|---------|-------------------------|
| **1** | Páginas `.html` com conteúdo estático (tabuleiro e tabelas com valores fixos) + todo o CSS. **Nenhuma tag `<script>`** nas páginas: a entrega não pode ter funcionalidade, e assim as páginas abrem por duplo clique. `assets/js`, `api/`, `src/` e `database/` ainda são stubs. |
| **2** | Implementa `game/`, `ui/`, `pages/`, `utils/` e `LocalMatchRepository`. Nenhum PHP. Cada página com formulário carrega seu módulo de `pages/`; `ranking.html` continua estática (o ranking global depende do banco). Os stubs da Parcial 3 (`ApiMatchRepository`, `httpClient`, `RankingView`, `pages/ranking.js`) ficam fora do ZIP. |
| **3** | Páginas passam de `.html` para `.php` (mesmo HTML + `require` do bootstrap e `Session::requireAuth()` no topo; login/cadastro redirecionam se já logado). Implementa `api/`, `src/`, `database/`. Troca para `ApiMatchRepository`. |

Na Parcial 3, lembre de atualizar os links entre páginas (`jogo.html` → `jogo.php`).
