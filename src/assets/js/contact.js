// Contact form: client-side validation, Formspree submission and success/error states.
// Without JavaScript the form still posts natively to Formspree.
(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form || !window.fetch) return;

  const messages = JSON.parse(document.getElementById('form-messages').textContent);
  const submit = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const errorBox = form.querySelector('[data-form-error]');
  const success = document.querySelector('[data-form-success]');
  const resetButton = document.querySelector('[data-form-reset]');
  let sending = false;

  const PHONE = /^\+?[0-9\s\-()]{7,20}$/;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const fieldMessages = { name: messages.errName, phone: messages.errPhone, email: messages.errEmail, message: messages.errMessage };

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : messages.errName),
    phone: (v) => (PHONE.test(v.trim()) && v.replace(/\D/g, '').length >= 7 ? '' : messages.errPhone),
    email: (v) => (!v.trim() || EMAIL.test(v.trim()) ? '' : messages.errEmail),
    message: (v) => (v.trim().length >= 10 ? '' : messages.errMessage),
  };

  function setFieldError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = message;
      error.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
      error.hidden = true;
    }
  }

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const message = rule(input.value);
    setFieldError(input, message);
    return !message;
  }

  function validateAll() {
    let firstInvalid = null;
    for (const name of Object.keys(rules)) {
      const input = form.elements[name];
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // Validate on blur; once a field shows an error, re-check it while typing.
  for (const name of Object.keys(rules)) {
    const input = form.elements[name];
    input.addEventListener('blur', () => {
      if (input.value.trim() || input.hasAttribute('aria-invalid')) validateField(input);
    });
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) validateField(input);
    });
  }

  function setSending(state) {
    sending = state;
    // aria-disabled (not disabled) keeps keyboard focus on the button while sending.
    submit.setAttribute('aria-disabled', String(state));
    form.setAttribute('aria-busy', String(state));
    submitLabel.textContent = state ? messages.sending : messages.submit;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    errorBox.hidden = true;
    if (!validateAll()) return;

    setSending(true);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        form.reset();
        form.hidden = true;
        success.hidden = false;
        success.focus();
        return;
      }
      // Formspree returns { errors: [{ field, message }] } for validation problems.
      let mapped = false;
      try {
        const data = await response.json();
        for (const err of data.errors || []) {
          const input = err.field && form.elements[err.field];
          if (input && rules[err.field]) {
            // Always show our localised message, not Formspree's English text.
            setFieldError(input, fieldMessages[err.field]);
            mapped = true;
          }
        }
      } catch {
        // Non-JSON error body: fall through to the generic message.
      }
      if (mapped) form.querySelector('[aria-invalid="true"]')?.focus();
      else showError();
    } catch {
      showError();
    } finally {
      setSending(false);
    }
  });

  function showError() {
    errorBox.hidden = false;
    errorBox.scrollIntoView({ block: 'nearest' });
  }

  resetButton?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
