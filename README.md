# Acerte a Toupeira — SI401

Plataforma web do jogo *Whac-a-Mole* com modalidades **Clássica** e **Explosiva**,
autenticação de jogadores, histórico de partidas e ranking global.

**Stack:** HTML5 · CSS3 · JavaScript (ES Modules, sem frameworks) · PHP 8 (sem frameworks) · MySQL/MariaDB

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Estrutura de pastas, camadas, padrões e convenções — **leia primeiro** |
| [docs/REGRAS-DO-JOGO.md](docs/REGRAS-DO-JOGO.md) | Parâmetros definidos pelo grupo (t, x, tt, bombas, ranking) |
| [database/schema.sql](database/schema.sql) | Modelo do banco de dados |
| [docs/INSTRUCOES.txt](docs/INSTRUCOES.txt) | Instruções de instalação (vai no .ZIP de cada entrega) |

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
