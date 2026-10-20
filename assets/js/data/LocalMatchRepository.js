/**
 * Repositório de partidas em localStorage (Parcial 2 — sem back-end).
 * Contrato: save(matchResult): Promise<void> | listByCurrentUser(): Promise<MatchResult[]>
 *
 * Sem login real nesta parcial, as partidas pertencem a um jogador fixo de demonstração
 * (o mesmo exibido no cabeçalho das páginas). Na Parcial 3 o jogador vem da sessão PHP.
 */
const STORAGE_KEY = 'acerte-a-toupeira:matches';

export const DEMO_PLAYER = Object.freeze({
    username: 'joao123',
    fullName: 'João Silva',
});

export class LocalMatchRepository {
    constructor(storage = globalThis.localStorage, player = DEMO_PLAYER) {
        this.storage = storage;
        this.player = player;
    }

    async save(matchResult) {
        const matches = this.#readAll();
        matches.push({ ...matchResult, username: this.player.username, playerName: this.player.fullName });
        this.storage.setItem(STORAGE_KEY, JSON.stringify(matches));
    }

    /** Partidas do jogador atual, da mais recente para a mais antiga. */
    async listByCurrentUser() {
        return this.#readAll()
            .filter((match) => match.username === this.player.username)
            .sort((a, b) => b.playedAt.localeCompare(a.playedAt));
    }

    #readAll() {
        try {
            const matches = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? '[]');
            return Array.isArray(matches) ? matches : [];
        } catch {
            return [];   // conteúdo corrompido: começa um histórico novo
        }
    }
}
