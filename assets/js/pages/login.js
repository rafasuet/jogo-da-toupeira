/**
 * Página de login (index): valida campos e envia credenciais.
 * Parcial 2: sem back-end, credenciais válidas no formato levam direto ao jogo.
 */
import { FormView } from '../ui/FormView.js';
import { collectErrors, isFilled } from '../utils/validators.js';

const RULES = [
    { field: 'username', test: isFilled, message: 'Informe seu nome de usuário.' },
    { field: 'password', test: isFilled, message: 'Informe sua senha.' },
];

const form = document.getElementById('login-form');
const view = new FormView(form);

if (new URLSearchParams(window.location.search).get('cadastro') === 'ok') {
    view.showMessage('Conta criada! Entre com seu usuário e senha.', 'success');
}

view.onSubmit(
    (values) => collectErrors(values, RULES),
    () => window.location.assign(form.getAttribute('action')),
);
