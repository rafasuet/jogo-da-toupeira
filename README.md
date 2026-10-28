# Acerte a Toupeira

![JavaScript](https://img.shields.io/badge/JavaScript_ES_Modules-F7DF1E?logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP_8-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL%20%2F%20MariaDB-4479A1?logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

Plataforma web do jogo *Whac-a-Mole*, com cadastro de jogadores, histórico de partidas e ranking global. Front-end em JavaScript puro e back-end em PHP com MySQL, **sem frameworks**: toda a arquitetura foi desenhada à mão. Projeto em grupo da disciplina **SI401 — Programação para a Web** (FT-Unicamp, 2026).

> **Status:** em desenvolvimento. O jogo completo no navegador (Parcial 2) está pronto e salva as partidas no `localStorage`. A API em PHP + MySQL (Parcial 3) já tem o banco e as camadas definidos, e a implementação dos endpoints está em andamento.

## Destaques

- **Duas modalidades:** Clássica e Explosiva (25% de chance de surgir uma bomba que tira ponto). A dificuldade aumenta a cada nível pela fórmula `tt(n) = max(400, 1500 × 0,85^(n−1))` ms.
- **Arquitetura em camadas:** no front, a regra do jogo (`game/`) não toca no DOM e as views (`ui/`) só renderizam. No back, o fluxo é `api → Services → Repositories → Core (PDO)`, com o SQL isolado nos repositórios.
- **Persistência trocável:** a interface `MatchRepository` tem duas implementações, `LocalMatchRepository` (localStorage) e `ApiMatchRepository` (HTTP + MySQL), e o jogo não muda ao trocar uma pela outra.
- **Back-end:** endpoints JSON finos, senhas com `password_hash`, validação no servidor (`src/Validation`) e ranking Top 10 por modalidade, com o modelo do banco em `database/schema.sql`.
- **Checklist de qualidade a cada entrega:** validação W3C de HTML e CSS, nada de script inline nem `style=""`, e um script PowerShell que gera o pacote sem credenciais locais.

**Stack:** HTML5 · CSS3 · JavaScript (ES Modules, sem frameworks) · PHP 8 (sem frameworks) · MySQL/MariaDB

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Estrutura de pastas, camadas, padrões e convenções — **leia primeiro** |
| [docs/REGRAS-DO-JOGO.md](docs/REGRAS-DO-JOGO.md) | Parâmetros definidos pelo grupo (t, x, tt, bombas, ranking) |
| [database/schema.sql](database/schema.sql) | Modelo do banco de dados |

## Rodando localmente

Módulos ES exigem um servidor HTTP (abrir o `.html` com duplo clique **não funciona**):

```bash
php -S localhost:8000             # na raiz do projeto
python -m http.server 8000        # alternativa sem PHP (Parcial 2)
```

Ou coloque a pasta em `htdocs/` do XAMPP e acesse `http://localhost/<pasta>/`.

## Banco de dados (Parcial 3)

1. Inicie o MySQL/MariaDB (MySQL 8+ ou MariaDB 10.5+).
2. Copie `src/config/config.example.php` para `src/config/config.php` e ajuste usuário e senha.
3. Na raiz do projeto, rode `php database/setup.php` (ou importe `database/schema.sql` no phpMyAdmin).
4. Acesse o sistema e crie uma conta pela página de cadastro.

## Checklist antes de cada entrega

- [ ] Todas as páginas passam no [validador HTML do W3C](https://validator.w3.org/)
- [ ] Todos os `.css` passam no [validador CSS do W3C](https://jigsaw.w3.org/css-validator/)
- [ ] Nenhum `<script>` com código inline e nenhum `style=""`
- [ ] `docs/INSTRUCOES.txt` atualizado com o link do vídeo
- [ ] Planilha .XLSX de contribuições preenchida
- [ ] .ZIP gerado pelo script (inclui só os arquivos do projeto, sem credenciais locais):
      `powershell -ExecutionPolicy Bypass -File scripts\empacotar.ps1 -Parcial N`
