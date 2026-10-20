/**
 * Contadores do nível atual (exibidas, acertadas, bombas), % de acerto e critério de aprovação. Sem DOM.
 *
 * Placar do nível = soma dos pontos dos cliques (toupeira +1, bomba −1).
 * % de acerto = placar ÷ toupeiras exibidas (bombas não entram no denominador).
 */
import { CREATURE } from './constants.js';

export class LevelStats {
    constructor(level) {
        this.level = level;
        this.molesShown = 0;
        this.molesHit = 0;
        this.bombsHit = 0;
        this.score = 0;
    }

    recordSpawn(creature) {
        if (creature === CREATURE.MOLE) {
            this.molesShown++;
        }
    }

    recordHit(creature, points) {
        if (creature === CREATURE.MOLE) {
            this.molesHit++;
        } else if (creature === CREATURE.BOMB) {
            this.bombsHit++;
        }
        this.score += points;
    }

    get hitRatio() {
        return this.molesShown === 0 ? 0 : this.score / this.molesShown;
    }

    isPassed(requiredRatio) {
        return this.molesShown > 0 && this.hitRatio >= requiredRatio;
    }
}
