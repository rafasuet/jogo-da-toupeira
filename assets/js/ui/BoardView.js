/**
 * Renderiza a grade de buracos e mostra/esconde toupeiras e bombas. Repassa cliques via callback.
 */
import { CREATURE } from '../game/constants.js';

const CREATURE_IMAGES = Object.freeze({
    [CREATURE.MOLE]: new URL('../../img/mole.svg', import.meta.url).href,
    [CREATURE.BOMB]: new URL('../../img/bomb.svg', import.meta.url).href,
});

const CREATURE_LABELS = Object.freeze({
    [CREATURE.MOLE]: 'toupeira',
    [CREATURE.BOMB]: 'bomba',
});

const HIT_FEEDBACK_CLASSES = Object.freeze({
    [CREATURE.MOLE]: 'hole--whacked',
    [CREATURE.BOMB]: 'hole--exploded',
});

const IMAGE_SIZE = 120;

export class BoardView {
    #holes = [];

    /**
     * @param {HTMLElement} element  a lista (.board) que recebe os buracos
     * @param {{ onHit: (index: number) => void }} callbacks
     */
    constructor(element, { onHit }) {
        this.element = element;
        this.onHit = onHit;

        // pointerdown responde no instante do toque/clique (o click só dispara ao soltar,
        // e a toupeira pode ter se escondido). O click com detail 0 vem do teclado.
        element.addEventListener('pointerdown', (event) => {
            if (event.button === 0) {
                this.#handleHit(event);
            }
        });
        element.addEventListener('click', (event) => {
            if (event.detail === 0) {
                this.#handleHit(event);
            }
        });
    }

    render(rows, cols) {
        this.element.style.setProperty('--board-cols', String(cols));
        this.element.setAttribute('aria-label', `Tabuleiro de ${rows} por ${cols} buracos`);

        this.#holes = Array.from({ length: rows * cols }, (_, index) => this.#createHole(index));
        this.element.replaceChildren(...this.#holes.map((hole) => {
            const item = document.createElement('li');
            item.append(hole);
            return item;
        }));
    }

    showCreature(index, creature) {
        const hole = this.#holes[index];
        hole.querySelector('.hole__creature').src = CREATURE_IMAGES[creature];
        hole.classList.add('hole--up');
        hole.setAttribute('aria-label', `Buraco ${index + 1}: ${CREATURE_LABELS[creature]}`);
    }

    hideCreature(index) {
        const hole = this.#holes[index];
        hole.classList.remove('hole--up');
        hole.setAttribute('aria-label', `Buraco ${index + 1}: vazio`);
    }

    /** Destaque rápido no buraco acertado (verde para toupeira, vermelho para bomba). */
    showHitFeedback(index, creature) {
        const hole = this.#holes[index];
        const feedbackClass = HIT_FEEDBACK_CLASSES[creature];
        hole.classList.remove(feedbackClass);
        void hole.offsetWidth;   // reinicia a animação se o mesmo buraco for acertado de novo
        hole.classList.add(feedbackClass);
        hole.addEventListener('animationend', () => hole.classList.remove(feedbackClass), { once: true });
    }

    setEnabled(enabled) {
        this.#holes.forEach((hole) => {
            hole.disabled = !enabled;
        });
    }

    #createHole(index) {
        const hole = document.createElement('button');
        hole.type = 'button';
        hole.className = 'hole';
        hole.dataset.index = String(index);
        hole.disabled = true;
        hole.setAttribute('aria-label', `Buraco ${index + 1}: vazio`);

        const creature = document.createElement('img');
        creature.className = 'hole__creature';
        creature.src = CREATURE_IMAGES[CREATURE.MOLE];
        creature.alt = '';
        creature.width = IMAGE_SIZE;
        creature.height = IMAGE_SIZE;
        creature.draggable = false;
        hole.append(creature);

        return hole;
    }

    #handleHit(event) {
        const hole = event.target.closest('.hole');
        if (hole && !hole.disabled) {
            event.preventDefault();
            this.onHit(Number(hole.dataset.index));
        }
    }
}
