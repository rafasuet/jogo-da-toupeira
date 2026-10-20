/**
 * Formatação para exibição: data/hora pt-BR, CPF, telefone, dimensões do tabuleiro (ex.: 4 × 5), nome da modalidade.
 */
import { GAME_MODE } from '../game/constants.js';

const MODE_NAMES = Object.freeze({
    [GAME_MODE.CLASSIC]: 'Clássica',
    [GAME_MODE.EXPLOSIVE]: 'Explosiva',
});

const MINUS_SIGN = '−';

const pad2 = (value) => String(value).padStart(2, '0');

export function onlyDigits(value) {
    return String(value).replace(/\D/g, '');
}

/** "29/09/2026 21:14" (horário local). */
export function formatDateTime(isoString) {
    const date = new Date(isoString);
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Valor para o atributo datetime de <time>: "2026-09-29T21:14" (horário local). */
export function toDateTimeAttribute(isoString) {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Tempo restante "mm:ss", arredondado para cima (o relógio só chega a 00:00 no fim). */
export function formatDuration(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    return `${pad2(Math.floor(totalSeconds / 60))}:${pad2(totalSeconds % 60)}`;
}

/** Valor para o atributo datetime de <time> em durações: "PT18S". */
export function toDurationAttribute(ms) {
    return `PT${Math.ceil(Math.max(0, ms) / 1000)}S`;
}

export function formatBoardSize(rows, cols) {
    return `${rows} × ${cols}`;
}

export function formatModeName(mode) {
    return MODE_NAMES[mode] ?? mode;
}

/** Inteiro com o sinal de menos tipográfico (−2), como nas tabelas. */
export function formatScore(score) {
    return score < 0 ? `${MINUS_SIGN}${Math.abs(score)}` : String(score);
}

/** Razão 0,75 → "75%". */
export function formatPercent(ratio) {
    return `${formatScore(Math.round(ratio * 100))}%`;
}

/** Máscara progressiva de CPF: "12345678909" → "123.456.789-09". */
export function formatCpf(value) {
    const digits = onlyDigits(value).slice(0, 11);
    let formatted = digits.slice(0, 3);
    if (digits.length > 3) formatted += `.${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `.${digits.slice(6, 9)}`;
    if (digits.length > 9) formatted += `-${digits.slice(9)}`;
    return formatted;
}

/** Máscara progressiva de telefone: fixo "(19) 3333-4444" ou celular "(19) 99999-8888". */
export function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) {
        return digits.length === 0 ? '' : `(${digits}`;
    }
    const splitAt = digits.length === 11 ? 7 : 6;
    const first = digits.slice(2, splitAt);
    const second = digits.slice(splitAt);
    return `(${digits.slice(0, 2)}) ${first}${second ? `-${second}` : ''}`;
}
