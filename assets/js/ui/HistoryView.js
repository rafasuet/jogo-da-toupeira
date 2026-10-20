/**
 * Renderiza a tabela de histórico de partidas do jogador (usar textContent, nunca innerHTML com dados).
 */
import {
    formatBoardSize,
    formatDateTime,
    formatModeName,
    formatScore,
    toDateTimeAttribute,
} from '../utils/formatters.js';

export class HistoryView {
    /** @param {HTMLTableSectionElement} tbody */
    constructor(tbody) {
        this.tbody = tbody;
        this.columnCount = tbody.closest('table').tHead.rows[0].cells.length;
    }

    render(matches) {
        if (matches.length === 0) {
            this.showMessage('Nenhuma partida registrada ainda. Que tal jogar a primeira?');
            return;
        }
        this.tbody.replaceChildren(...matches.map((match) => this.#createRow(match)));
    }

    /** Linha única ocupando a tabela toda (vazio, carregando, erro). */
    showMessage(text) {
        const row = this.tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = this.columnCount;
        cell.className = 'is-empty';
        cell.textContent = text;
        this.tbody.replaceChildren(row);
    }

    #createRow(match) {
        const row = document.createElement('tr');
        const addCell = (content, className = '') => {
            const cell = row.insertCell();
            cell.className = className;
            cell.append(content);
            return cell;
        };

        const badge = document.createElement('span');
        badge.className = `badge badge--${match.mode}`;
        badge.textContent = formatModeName(match.mode);

        const playedAt = document.createElement('time');
        playedAt.dateTime = toDateTimeAttribute(match.playedAt);
        playedAt.textContent = formatDateTime(match.playedAt);

        addCell(match.playerName);
        addCell(formatBoardSize(match.rows, match.cols));
        addCell(badge);
        addCell(formatScore(match.score), match.score < 0 ? 'is-numeric score--negative' : 'is-numeric');
        addCell(String(match.levelReached), 'is-numeric');
        addCell(playedAt);
        return row;
    }
}
