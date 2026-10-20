/**
 * Máquina de estados da partida (idle → running → levelTransition → finished).
 * Agenda surgimentos, processa cliques e emite eventos (levelStart, tick, spawn, hide, hit,
 * levelComplete, gameOver). Não acessa o DOM: a UI escuta os eventos via on(evento, callback).
 *
 * Todo evento recebe { ...dadosDoEvento, snapshot }, em que snapshot é getSnapshot().
 */
import { Board } from './Board.js';
import { DifficultyPolicy } from './DifficultyPolicy.js';
import { createGameMode } from './GameMode.js';
import { LevelStats } from './LevelStats.js';
import { Timer } from './Timer.js';
import { CREATURE, END_REASON, LEVEL } from './constants.js';

export const ENGINE_STATE = Object.freeze({
    IDLE: 'idle',
    RUNNING: 'running',
    LEVEL_TRANSITION: 'levelTransition',
    FINISHED: 'finished',
});

export const HIDE_REASON = Object.freeze({
    TIMEOUT: 'timeout',
    HIT: 'hit',
    LEVEL_END: 'levelEnd',
});

const EVENTS = ['levelStart', 'tick', 'spawn', 'hide', 'hit', 'levelComplete', 'gameOver'];

export class GameEngine {
    #listeners = new Map(EVENTS.map((event) => [event, new Set()]));
    #holes = new Map();           // índice do buraco → { creature, hideTimeoutId }
    #state = ENGINE_STATE.IDLE;
    #level = 0;
    #stats = new LevelStats(0);
    #score = 0;
    #molesHit = 0;
    #bombsHit = 0;
    #levelEndsAt = 0;

    /**
     * @param {{ rows: number, cols: number, mode: string }} options
     * Dependências opcionais (difficulty, timer, clock, random, levelConfig) existem para testes.
     */
    constructor({
        rows,
        cols,
        mode,
        difficulty = new DifficultyPolicy(),
        timer = new Timer(),
        clock = () => Date.now(),
        random = Math.random,
        levelConfig = LEVEL,
    }) {
        this.board = new Board(rows, cols);
        this.mode = createGameMode(mode, random);
        this.difficulty = difficulty;
        this.timer = timer;
        this.clock = clock;
        this.random = random;
        this.levelConfig = levelConfig;
    }

    get state() {
        return this.#state;
    }

    /** Registra um ouvinte e devolve a função que o remove. */
    on(event, callback) {
        const listeners = this.#listeners.get(event);
        if (!listeners) {
            throw new RangeError(`Evento desconhecido: ${event}`);
        }
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    start() {
        if (this.#state !== ENGINE_STATE.IDLE) {
            throw new Error('A partida já foi iniciada.');
        }
        this.#startLevel(1);
    }

    /** Clique no buraco `index`. Buraco vazio ou partida parada: nada acontece. */
    hit(index) {
        if (this.#state !== ENGINE_STATE.RUNNING) {
            return;
        }
        const hole = this.#holes.get(index);
        if (!hole) {
            return;
        }
        this.timer.clearTimeout(hole.hideTimeoutId);
        this.#holes.delete(index);

        const points = this.mode.scoreFor(hole.creature);
        this.#stats.recordHit(hole.creature, points);
        this.#score += points;
        if (hole.creature === CREATURE.MOLE) {
            this.#molesHit++;
        } else {
            this.#bombsHit++;
        }

        this.#emit('hit', { index, creature: hole.creature, points });
        this.#emit('hide', { index, reason: HIDE_REASON.HIT });
    }

    /** Desistência: encerra a partida e a registra com o motivo "quit". */
    quit() {
        if (this.#state === ENGINE_STATE.RUNNING || this.#state === ENGINE_STATE.LEVEL_TRANSITION) {
            this.#finish(END_REASON.QUIT);
        }
    }

    getSnapshot() {
        return {
            state: this.#state,
            mode: this.mode.name,
            rows: this.board.rows,
            cols: this.board.cols,
            level: this.#level,
            remainingMs: this.#remainingMs(),
            score: this.#score,
            molesHit: this.#molesHit,
            bombsHit: this.#bombsHit,
            levelScore: this.#stats.score,
            levelMolesShown: this.#stats.molesShown,
            levelHitRatio: this.#stats.hitRatio,
            requiredRatio: this.levelConfig.REQUIRED_HIT_RATIO,
        };
    }

    #startLevel(level) {
        this.#level = level;
        this.#stats = new LevelStats(level);
        this.#state = ENGINE_STATE.RUNNING;
        this.#levelEndsAt = this.clock() + this.levelConfig.DURATION_MS;

        const visibleMs = this.difficulty.visibleMsFor(level);
        this.timer.setInterval(() => this.#spawn(visibleMs), this.difficulty.spawnIntervalMsFor(level));
        this.timer.setInterval(() => this.#emit('tick', {}), this.levelConfig.TICK_MS);
        this.timer.setTimeout(() => this.#endLevel(), this.levelConfig.DURATION_MS);

        this.#emit('levelStart', { level, visibleMs });
    }

    #spawn(visibleMs) {
        // Não surge nada que não teria tempo de ficar visível até o fim do nível.
        if (this.#remainingMs() < visibleMs) {
            return;
        }
        const index = this.board.pickFreeHole(new Set(this.#holes.keys()), this.random);
        if (index === null) {
            return;
        }
        const creature = this.mode.pickCreature();
        this.#stats.recordSpawn(creature);
        const hideTimeoutId = this.timer.setTimeout(() => this.#hide(index), visibleMs);
        this.#holes.set(index, { creature, hideTimeoutId });

        this.#emit('spawn', { index, creature, visibleMs });
    }

    #hide(index) {
        if (this.#holes.delete(index)) {
            this.#emit('hide', { index, reason: HIDE_REASON.TIMEOUT });
        }
    }

    /** Esconde tudo o que está à mostra. Chamar depois de timer.clearAll(). */
    #hideAll() {
        const indexes = [...this.#holes.keys()];
        this.#holes.clear();
        indexes.forEach((index) => this.#emit('hide', { index, reason: HIDE_REASON.LEVEL_END }));
    }

    #endLevel() {
        this.timer.clearAll();
        this.#hideAll();

        if (!this.#stats.isPassed(this.levelConfig.REQUIRED_HIT_RATIO)) {
            this.#finish(END_REASON.DEFEAT);
            return;
        }

        this.#state = ENGINE_STATE.LEVEL_TRANSITION;
        const nextLevel = this.#level + 1;
        this.#emit('levelComplete', { level: this.#level, nextLevel });
        this.timer.setTimeout(() => this.#startLevel(nextLevel), this.levelConfig.TRANSITION_MS);
    }

    #finish(endReason) {
        this.timer.clearAll();
        this.#hideAll();
        this.#state = ENGINE_STATE.FINISHED;

        const result = {
            rows: this.board.rows,
            cols: this.board.cols,
            mode: this.mode.name,
            score: this.#score,
            molesHit: this.#molesHit,
            bombsHit: this.#bombsHit,
            levelReached: this.#level,
            endReason,
            playedAt: new Date(this.clock()).toISOString(),
        };
        this.#emit('gameOver', { result, reason: endReason });
    }

    #remainingMs() {
        switch (this.#state) {
            case ENGINE_STATE.IDLE:
                return this.levelConfig.DURATION_MS;
            case ENGINE_STATE.RUNNING:
                return Math.max(0, this.#levelEndsAt - this.clock());
            default:
                return 0;
        }
    }

    #emit(event, payload) {
        const snapshot = this.getSnapshot();
        this.#listeners.get(event).forEach((callback) => callback({ ...payload, snapshot }));
    }
}
