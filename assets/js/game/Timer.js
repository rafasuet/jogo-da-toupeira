/**
 * Encapsula setTimeout/setInterval da partida, permitindo cancelar todos os timers de uma vez. Sem DOM.
 */
export class Timer {
    #timeouts = new Set();
    #intervals = new Set();

    setTimeout(callback, delayMs) {
        const id = globalThis.setTimeout(() => {
            this.#timeouts.delete(id);
            callback();
        }, delayMs);
        this.#timeouts.add(id);
        return id;
    }

    clearTimeout(id) {
        globalThis.clearTimeout(id);
        this.#timeouts.delete(id);
    }

    setInterval(callback, delayMs) {
        const id = globalThis.setInterval(callback, delayMs);
        this.#intervals.add(id);
        return id;
    }

    clearInterval(id) {
        globalThis.clearInterval(id);
        this.#intervals.delete(id);
    }

    clearAll() {
        this.#timeouts.forEach((id) => globalThis.clearTimeout(id));
        this.#intervals.forEach((id) => globalThis.clearInterval(id));
        this.#timeouts.clear();
        this.#intervals.clear();
    }
}
