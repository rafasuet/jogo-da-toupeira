/**
 * Strategy das modalidades de jogo.
 * Cada modalidade decide O QUE surge no buraco e QUAL o efeito de um clique no placar.
 * O GameEngine depende apenas da interface comum: pickCreature() e scoreFor(creature).
 */
import { CREATURE, EXPLOSIVE, GAME_MODE } from './constants.js';

export class ClassicMode {
    name = GAME_MODE.CLASSIC;

    pickCreature() {
        return CREATURE.MOLE;
    }

    scoreFor(creature) {
        return creature === CREATURE.MOLE ? 1 : 0;
    }
}

export class ExplosiveMode {
    name = GAME_MODE.EXPLOSIVE;

    constructor(random = Math.random) {
        this.random = random;
    }

    pickCreature() {
        return this.random() < EXPLOSIVE.BOMB_PROBABILITY ? CREATURE.BOMB : CREATURE.MOLE;
    }

    scoreFor(creature) {
        return creature === CREATURE.BOMB ? -EXPLOSIVE.BOMB_PENALTY : 1;
    }
}

export function createGameMode(modeName, random = Math.random) {
    switch (modeName) {
        case GAME_MODE.CLASSIC:
            return new ClassicMode();
        case GAME_MODE.EXPLOSIVE:
            return new ExplosiveMode(random);
        default:
            throw new RangeError(`Modalidade desconhecida: ${modeName}`);
    }
}
