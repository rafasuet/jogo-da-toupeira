/**
 * Dimensões do tabuleiro (linhas × colunas), validação dos limites e sorteio de buraco livre. Sem DOM.
 */
import { BOARD } from './constants.js';

export class Board {
    constructor(rows, cols) {
        if (!Board.isValid(rows, cols)) {
            throw new RangeError(`Tabuleiro inválido: ${rows} × ${cols}.`);
        }
        this.rows = rows;
        this.cols = cols;
    }

    static isValid(rows, cols) {
        const isValidSide = (side) => Number.isInteger(side) && side >= BOARD.MIN_SIDE && side <= BOARD.MAX_SIDE;
        const holes = rows * cols;
        return isValidSide(rows) && isValidSide(cols) && holes >= BOARD.MIN_HOLES && holes <= BOARD.MAX_HOLES;
    }

    get holeCount() {
        return this.rows * this.cols;
    }

    /**
     * Sorteia um buraco que não está em `occupied` (Set de índices).
     * Retorna null quando todos estão ocupados.
     */
    pickFreeHole(occupied, random = Math.random) {
        const free = [];
        for (let index = 0; index < this.holeCount; index++) {
            if (!occupied.has(index)) {
                free.push(index);
            }
        }
        if (free.length === 0) {
            return null;
        }
        return free[Math.floor(random() * free.length)];
    }
}
