/**
 * Página de perfil: carrega e atualiza dados pessoais (data de nascimento, CPF e username são somente leitura).
 * Parcial 2: sem back-end, os dados exibidos são os do jogador de demonstração e a alteração
 * é apenas validada (a gravação chega na Parcial 3).
 */
import { FormView } from '../ui/FormView.js';
import { formatPhone } from '../utils/formatters.js';
import {
    PASSWORD_MIN_LENGTH,
    collectErrors,
    isFilled,
    isValidEmail,
    isValidFullName,
    isValidPassword,
    isValidPhone,
} from '../utils/validators.js';

const PASSWORD_FIELDS = ['current_password', 'new_password', 'new_password_confirm'];

/** A troca de senha é opcional: as regras só valem se algum dos três campos foi preenchido. */
const wantsPasswordChange = (values) => PASSWORD_FIELDS.some((name) => isFilled(values[name] ?? ''));
const whenChangingPassword = (test) => (value, values) => !wantsPasswordChange(values) || test(value, values);

const RULES = [
    { field: 'full_name', test: isFilled, message: 'Informe seu nome completo.' },
    { field: 'full_name', test: isValidFullName, message: 'Informe nome e sobrenome, usando apenas letras.' },
    { field: 'phone', test: isFilled, message: 'Informe seu telefone.' },
    { field: 'phone', test: isValidPhone, message: 'Telefone inválido. Use DDD e número, por exemplo (19) 99999-9999.' },
    { field: 'email', test: isFilled, message: 'Informe seu e-mail.' },
    { field: 'email', test: isValidEmail, message: 'E-mail inválido. Exemplo: voce@exemplo.com.' },
    { field: 'current_password', test: whenChangingPassword(isFilled), message: 'Informe a senha atual para trocá-la.' },
    { field: 'new_password', test: whenChangingPassword(isFilled), message: 'Informe a nova senha.' },
    { field: 'new_password', test: whenChangingPassword(isValidPassword), message: `A nova senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.` },
    { field: 'new_password', test: whenChangingPassword((value, values) => value !== values.current_password), message: 'A nova senha deve ser diferente da atual.' },
    { field: 'new_password_confirm', test: whenChangingPassword((value, values) => value === values.new_password), message: 'As senhas não conferem.' },
];

const form = document.getElementById('profile-form');
const view = new FormView(form);

view.applyMask('phone', formatPhone);

view.onSubmit(
    (values) => collectErrors(values, RULES),
    (values) => {
        PASSWORD_FIELDS.forEach((name) => {
            form.elements.namedItem(name).value = '';
        });
        const message = wantsPasswordChange(values) ? 'Dados e senha atualizados com sucesso.' : 'Dados atualizados com sucesso.';
        view.showMessage(message, 'success');
    },
);
