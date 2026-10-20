/**
 * Parâmetros do jogo. Única fonte de verdade para os valores definidos pelo grupo.
 * Qualquer alteração aqui deve ser refletida em docs/REGRAS-DO-JOGO.md.
 */

export const BOARD = Object.freeze({
    MIN_SIDE: 2,
    MAX_SIDE: 8,
    MIN_HOLES: 4,
    MAX_HOLES: 64,
});

export const LEVEL = Object.freeze({
    DURATION_MS: 30_000,          // t
    REQUIRED_HIT_RATIO: 0.7,      // x
    TRANSITION_MS: 2000,          // pausa entre um nível aprovado e o próximo
    TICK_MS: 250,                 // frequência de atualização do tempo restante
});

export const DIFFICULTY = Object.freeze({
    INITIAL_VISIBLE_MS: 1500,     // tt no nível 1
    DECAY_FACTOR: 0.85,           // tt(n) = tt(n-1) * DECAY_FACTOR
    MIN_VISIBLE_MS: 400,
    SPAWN_INTERVAL_RATIO: 0.8,    // intervalo entre surgimentos = tt * ratio
});

export const EXPLOSIVE = Object.freeze({
    BOMB_PROBABILITY: 0.25,
    BOMB_PENALTY: 1,
});

export const GAME_MODE = Object.freeze({
    CLASSIC: 'classic',
    EXPLOSIVE: 'explosive',
});

export const CREATURE = Object.freeze({
    MOLE: 'mole',
    BOMB: 'bomb',
});

export const END_REASON = Object.freeze({
    DEFEAT: 'defeat',
    QUIT: 'quit',
});
