/**
 * Validações de formulário no cliente: CPF (dígitos verificadores), e-mail, telefone, data, senha.
 * O servidor repete as validações (src/Validation) — o cliente só melhora a experiência.
 */
import { onlyDigits } from './formatters.js';

export const FULL_NAME_MAX_LENGTH = 120;
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,30}$/;
const MIN_BIRTH_YEAR = 1900;

/**
 * Aplica as regras em ordem e devolve { campo: mensagem } com o primeiro erro de cada campo.
 * Regra: { field, test: (valor, todosOsValores) => boolean, message }.
 */
export function collectErrors(values, rules) {
    const errors = {};
    for (const { field, test, message } of rules) {
        if (!(field in errors) && !test(values[field] ?? '', values)) {
            errors[field] = message;
        }
    }
    return errors;
}

export function isFilled(value) {
    return String(value).trim().length > 0;
}

/** Ao menos nome e sobrenome, só com letras, espaços, apóstrofo, hífen ou ponto. */
export function isValidFullName(value) {
    const name = value.trim();
    return name.length <= FULL_NAME_MAX_LENGTH
        && /^[\p{L}][\p{L}'.-]*(\s+[\p{L}][\p{L}'.-]*)+$/u.test(name);
}

/** CPF com 11 dígitos e dígitos verificadores corretos (aceita com ou sem pontuação). */
export function isValidCpf(value) {
    const digits = onlyDigits(value);
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
        return false;
    }
    const checkDigit = (length) => {
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += Number(digits[i]) * (length + 1 - i);
        }
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };
    return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

/** DDD + 8 dígitos (fixo) ou DDD + 9 + 8 dígitos (celular). */
export function isValidPhone(value) {
    const digits = onlyDigits(value);
    if (!/^[1-9]{2}/.test(digits)) {
        return false;
    }
    return digits.length === 10 || (digits.length === 11 && digits[2] === '9');
}

export function isValidEmail(value) {
    const email = value.trim();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Data "AAAA-MM-DD" existente no calendário, a partir de 1900 e não futura. */
export function isValidBirthDate(value, today = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return false;
    }
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return isRealDate && year >= MIN_BIRTH_YEAR && date <= today;
}

export function isValidUsername(value) {
    return USERNAME_PATTERN.test(value);
}

export function isValidPassword(value) {
    return value.length >= PASSWORD_MIN_LENGTH;
}
