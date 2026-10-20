/**
 * Exibe tempo restante, modalidade, total de acertos, % de acerto no nível e % necessária.
 * Os elementos são localizados pelo atributo data-hud dentro do container recebido.
 */
import {
    formatBoardSize,
    formatDuration,
    formatModeName,
    formatPercent,
    formatScore,
    toDurationAttribute,
} from '../utils/formatters.js';

export class HudView {
    constructor(root) {
        const find = (name) => root.querySelector(`[data-hud="${name}"]`);
        this.time = find('time');
        this.mode = find('mode');
        this.level = find('level');
        this.molesHit = find('moles-hit');
        this.ratio = find('ratio');
        this.ratioDetail = find('ratio-detail');
        this.required = find('required');
        this.progress = find('progress');
        this.boardSize = find('board-size');
        this.score = find('score');
    }

    /** @param {ReturnType<import('../game/GameEngine.js').GameEngine['getSnapshot']>} snapshot */
    render(snapshot) {
        this.time.textContent = formatDuration(snapshot.remainingMs);
        this.time.dateTime = toDurationAttribute(snapshot.remainingMs);
        this.mode.textContent = formatModeName(snapshot.mode);
        this.level.textContent = snapshot.level === 0 ? '—' : String(snapshot.level);
        this.molesHit.textContent = String(snapshot.molesHit);

        const percent = Math.round(snapshot.levelHitRatio * 100);
        this.ratio.textContent = formatPercent(snapshot.levelHitRatio);
        this.ratio.classList.toggle('is-below', snapshot.levelMolesShown > 0 && snapshot.levelHitRatio < snapshot.requiredRatio);
        this.ratioDetail.textContent = `${formatScore(snapshot.levelScore)} de ${snapshot.levelMolesShown}`;
        this.required.textContent = formatPercent(snapshot.requiredRatio);
        this.progress.value = Math.min(100, Math.max(0, percent));
        this.progress.textContent = `${this.progress.value}%`;

        this.boardSize.textContent = formatBoardSize(snapshot.rows, snapshot.cols);
        this.score.textContent = formatScore(snapshot.score);
    }
}
