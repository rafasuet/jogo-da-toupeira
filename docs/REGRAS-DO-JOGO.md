# Regras do jogo — decisões do grupo

O enunciado deixa alguns parâmetros a cargo do grupo. Esta é a **proposta inicial**;
qualquer ajuste deve ser feito aqui **e** em `assets/js/game/constants.js`.

## Tabuleiro

- Linhas e colunas escolhidas entre **2 e 8** cada → total de buracos sempre entre
  4 (2×2) e 64 (8×8), sempre retangular.

## Níveis (as duas modalidades)

| Parâmetro | Símbolo | Valor proposto |
|-----------|---------|----------------|
| Duração de cada nível | t | **30 s** |
| % mínima de acerto para avançar | x | **70 %** |
| Tempo visível da toupeira no nível 1 | tt₁ | **1500 ms** |
| Redução de tt a cada nível | — | **× 0,85** |
| Tempo visível mínimo | tt_min | **400 ms** |
| Intervalo entre surgimentos | — | **0,8 × tt** do nível |
| Pausa entre um nível aprovado e o próximo | — | **2 s** |

Fórmula: `tt(n) = max(400, 1500 × 0,85^(n−1))` ms.

Exemplo: nível 1 = 1500 ms, nível 2 = 1275 ms, nível 5 ≈ 783 ms, nível 9+ ≈ 409 ms → 400 ms.

## Placar

- **Placar do nível** = toupeiras acertadas − bombas acertadas (pode ser negativo).
- **% de acerto do nível** = placar do nível ÷ toupeiras exibidas no nível × 100.
  (Bombas não contam como "exibidas" no denominador.)
- Ao fim dos t segundos: se % ≥ x → próximo nível; senão → fim de partida.
- **Pontuação da partida** = soma dos placares de todos os níveis jogados.
- Uma toupeira só pode ser acertada uma vez; clique em buraco vazio não altera nada.
- Nada surge nos últimos tt ms do nível: toda toupeira exibida tem o tempo visível
  inteiro para ser acertada (senão ela contaria no denominador sem chance real de acerto).
- Se todos os buracos estiverem ocupados (tabuleiros pequenos), o surgimento é pulado.

## Modalidade Explosiva

- Cada surgimento tem **25 %** de chance de ser bomba.
- Clique em bomba: placar do nível −1, e a bomba some.

## Fim de partida

Registrado no histórico em dois casos: **derrota** (não atingiu x) ou **desistência**
(botão "Desistir"). Dados salvos: dimensões, modalidade, pontuação, toupeiras acertadas,
bombas acertadas, nível atingido, motivo do fim, data/hora.

## Ranking global

- Duas tabelas, uma por modalidade (Clássica e Explosiva) — pontuações não são
  comparáveis entre modalidades.
- **Top 10 jogadores**, uma linha por jogador (sua **melhor** partida).
- Ordenação: pontuação ↓, nível atingido ↓, data da partida ↑ (quem fez primeiro vence).
- Colunas: posição, username, pontuação, nível, tabuleiro, data.
