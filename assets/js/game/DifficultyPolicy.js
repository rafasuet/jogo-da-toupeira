/**
 * Calcula o tempo visível (tt) e o intervalo de surgimento para um dado nível. Sem DOM.
 *
 * tt(n) = max(MIN_VISIBLE_MS, INITIAL_VISIBLE_MS × DECAY_FACTOR^(n−1))
 */
import { DIFFICULTY } from './constants.js';

export class DifficultyPolicy {
    constructor(config = DIFFICULTY) {
        this.config = config;
    }

    visibleMsFor(level) {
        const { INITIAL_VISIBLE_MS, DECAY_FACTOR, MIN_VISIBLE_MS } = this.config;
        const decayed = INITIAL_VISIBLE_MS * DECAY_FACTOR ** (level - 1);
        return Math.round(Math.max(MIN_VISIBLE_MS, decayed));
    }

    spawnIntervalMsFor(level) {
        return Math.round(this.visibleMsFor(level) * this.config.SPAWN_INTERVAL_RATIO);
    }
}
