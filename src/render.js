const renderFormError = (state, elements, i18n) => {
    const { input, submit, feedback } = elements;
    submit.disabled = false;
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    switch (state.error) {
        case 'url':
            feedback.textContent = i18n.t('feedback.invalidUrl');
            break;
        case 'required':
            feedback.textContent = i18n.t('feedback.invalidRequired');
            break;
        case 'notOneOf':
            feedback.textContent = i18n.t('feedback.invalidNotOneOf');
            break;
        case 'network error':
            feedback.textContent = i18n.t('feedback.invalidNetwork');
            break;
        case 'invalid rss':
            feedback.textContent = i18n.t('feedback.invalidRSS');
            break;
        default:
            feedback.textContent = i18n.t('feedback.invalidUnknown');
    }
};

const renderFormSuccess = (elements, i18n) => {
    const {
        form, input, submit, feedback,
    } = elements;
    submit.disabled = false;
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18n.t('feedback.success');
    form.reset();
    input.focus();
};

const handleFormState = (state, elements, i18n) => {
    const { input, submit, feedback } = elements;
    switch (state.formState) {
        case 'filling':
            submit.disabled = false;
            input.classList.remove('is-invalid');
            feedback.textContent = '';
            break;
        case 'sending':
            submit.disabled = true;
            feedback.textContent = i18n.t('feedback.loading');
            break;
        case 'success':
            return renderFormSuccess(elements, i18n);
        case 'error':
            return renderFormError(state, elements, i18n);
        default:
            throw new Error(`Unknown state: ${state.formState}`);
    }
    return state;
};

export default (state, elements, i18n) => (path) => {
    switch (path) {
        case 'formState':
            return handleFormState(state, elements, i18n);
        default:
            throw new Error(`Unknown path: ${path}`);
    }
};