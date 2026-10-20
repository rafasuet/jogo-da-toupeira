/**
 * Página de cadastro: valida campos e cria a conta.
 * Parcial 2: sem back-end, um cadastro válido volta ao login com aviso de sucesso.
 */
import { FormView } from '../ui/FormView.js';
import { formatCpf, formatPhone } from '../utils/formatters.js';
import {
    PASSWORD_MIN_LENGTH,
    collectErrors,
    isFilled,
    isValidBirthDate,
    isValidCpf,
    isValidEmail,
    isValidFullName,
    isValidPassword,
    isValidPhone,
    isValidUsername,
} from '../utils/validators.js';

const RULES = [
    { field: 'full_name', test: isFilled, message: 'Informe seu nome completo.' },
    { field: 'full_name', test: isValidFullName, message: 'Informe nome e sobrenome, usando apenas letras.' },
    { field: 'birth_date', test: isFilled, message: 'Informe sua data de nascimento.' },
    { field: 'birth_date', test: (value) => isValidBirthDate(value), message: 'Informe uma data de nascimento válida (não pode ser futura).' },
    { field: 'cpf', test: isFilled, message: 'Informe seu CPF.' },
    { field: 'cpf', test: isValidCpf, message: 'CPF inválido. Confira os números digitados.' },
    { field: 'phone', test: isFilled, message: 'Informe seu telefone.' },
    { field: 'phone', test: isValidPhone, message: 'Telefone inválido. Use DDD e número, por exemplo (19) 99999-9999.' },
    { field: 'email', test: isFilled, message: 'Informe seu e-mail.' },
    { field: 'email', test: isValidEmail, message: 'E-mail inválido. Exemplo: voce@exemplo.com.' },
    { field: 'username', test: isFilled, message: 'Escolha um nome de usuário.' },
    { field: 'username', test: isValidUsername, message: 'Use de 3 a 30 caracteres: letras sem acento, números, ponto ou _.' },
    { field: 'password', test: isFilled, message: 'Crie uma senha.' },
    { field: 'password', test: isValidPassword, message: `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.` },
    { field: 'password_confirm', test: isFilled, message: 'Confirme a senha.' },
    { field: 'password_confirm', test: (value, values) => value === values.password, message: 'As senhas não conferem.' },
];

const form = document.getElementById('register-form');
const view = new FormView(form);

view.applyMask('cpf', formatCpf);
view.applyMask('phone', formatPhone);
form.elements.namedItem('birth_date').max = new Date().toLocaleDateString('sv-SE');   // AAAA-MM-DD local

view.onSubmit(
    (values) => collectErrors(values, RULES),
    () => window.location.assign(`${form.getAttribute('action')}?cadastro=ok`),
);
