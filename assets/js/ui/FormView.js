/**
 * Exibe/limpa mensagens de erro e sucesso em formulários (login, cadastro, perfil).
 *
 * Assume a validação do formulário (noValidate): os atributos HTML (required, pattern…)
 * continuam como documentação e alternativa sem JS, mas as mensagens vêm do JavaScript.
 */
export class FormView {
    #message;

    /** @param {HTMLFormElement} form */
    constructor(form) {
        this.form = form;
        form.noValidate = true;

        this.#message = document.createElement('p');
        this.#message.className = 'form-message';
        this.#message.setAttribute('role', 'alert');
        this.#message.hidden = true;
        form.prepend(this.#message);

        // Ao editar um campo com erro, a mensagem dele some.
        form.addEventListener('input', (event) => {
            if (event.target.getAttribute('aria-invalid') === 'true') {
                this.#clearFieldError(event.target);
            }
        });
    }

    /** Valores do formulário por atributo name: { username: '...', ... }. */
    getValues() {
        return Object.fromEntries(new FormData(this.form));
    }

    /** Executa `submit(values)` só quando `validate(values)` não devolve erros. */
    onSubmit(validate, submit) {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.clearErrors();
            this.clearMessage();

            const values = this.getValues();
            const errors = validate(values);
            if (Object.keys(errors).length > 0) {
                this.showErrors(errors);
                return;
            }
            submit(values);
        });
    }

    /** @param {Record<string, string>} errors  nome do campo → mensagem */
    showErrors(errors) {
        const fields = Object.entries(errors).map(([name, message]) => {
            const field = this.form.elements.namedItem(name);
            this.#showFieldError(field, message);
            return field;
        });
        fields[0]?.focus();
    }

    clearErrors() {
        this.form.querySelectorAll('[aria-invalid="true"]').forEach((field) => this.#clearFieldError(field));
    }

    /** @param {'success' | 'error'} type */
    showMessage(text, type) {
        this.#message.textContent = text;
        this.#message.className = `form-message form-message--${type}`;
        this.#message.hidden = false;
        this.#message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearMessage() {
        this.#message.hidden = true;
        this.#message.textContent = '';
    }

    /** Formata o campo enquanto o usuário digita (ex.: CPF e telefone). */
    applyMask(name, format) {
        const field = this.form.elements.namedItem(name);
        const apply = () => {
            field.value = format(field.value);
        };
        // Só reformata com o cursor no fim, para não "pular" o cursor ao editar no meio.
        field.addEventListener('input', () => {
            if (field.selectionStart === field.value.length) {
                apply();
            }
        });
        field.addEventListener('blur', apply);
        apply();
    }

    #showFieldError(field, message) {
        const error = document.createElement('p');
        error.className = 'field__error';
        error.id = `${field.id}-error`;
        error.textContent = message;
        field.closest('.field').append(error);

        field.setAttribute('aria-invalid', 'true');
        const describedBy = field.getAttribute('aria-describedby');
        field.setAttribute('aria-describedby', describedBy ? `${describedBy} ${error.id}` : error.id);
    }

    #clearFieldError(field) {
        const errorId = `${field.id}-error`;
        document.getElementById(errorId)?.remove();
        field.removeAttribute('aria-invalid');

        const describedBy = (field.getAttribute('aria-describedby') ?? '')
            .split(' ')
            .filter((id) => id && id !== errorId)
            .join(' ');
        if (describedBy) {
            field.setAttribute('aria-describedby', describedBy);
        } else {
            field.removeAttribute('aria-describedby');
        }
    }
}
