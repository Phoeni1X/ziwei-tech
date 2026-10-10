(() => {
  'use strict';

  const form = document.querySelector('#custom-array-form');
  if (!form || !window.fetch || !window.AbortController) return;

  const submitButton = form.querySelector('#custom-submit');
  const newRequestButton = form.querySelector('#custom-new-request');
  const status = form.querySelector('#custom-form-status');
  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  const fieldsets = Array.from(form.querySelectorAll('fieldset'));
  const consent = form.querySelector('#forwarding-consent');
  let submitting = false;
  let submitted = false;
  let activationRequired = false;

  // Keep ordinary POST submission available when JavaScript is unavailable.
  form.noValidate = true;

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  function isContactMethod(value) {
    const contact = value.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return true;
    // Allow international/local telephone formats and common extension markers.
    const telephone = /^(\+?[\d\s()（）.\-]+?)(?:\s*(?:ext\.?|x|分机|转|#)\s*(\d{1,8}))?$/i.exec(contact);
    if (!telephone) return false;
    const digits = contact.replace(/\D/g, '');
    const mainDigits = telephone[1].replace(/\D/g, '');
    return mainDigits.length >= 7 && digits.length <= 20;
  }

  function validateField(field) {
    const error = document.getElementById(`${field.id}-error`);
    let message = '';
    if (field.type === 'checkbox') {
      if (!field.checked) message = '请同意将信息转发给紫微泰克，以便我们处理您的需求。';
    } else if (!field.value.trim()) {
      message = field.tagName === 'SELECT' ? '请选择阵列极化方式。' : '请填写此项；未确定的技术参数可填写“待确认”。';
      if (field.id === 'contact-method') message = '请填写您的手机号或电子邮箱。';
      if (field.id === 'contact-person') message = '请填写您的姓名或称呼。';
      if (field.id === 'contact-company') message = '请填写公司名称。';
    } else if (field.maxLength > 0 && field.value.length > field.maxLength) {
      message = `请将内容控制在 ${field.maxLength} 个字符以内。`;
    } else if (field.id === 'contact-method' && !isContactMethod(field.value)) {
      message = '请填写有效的电话号码或电子邮箱；电话可包含国家区号和分机。';
    }
    field.setCustomValidity(window.PMTI18n ? window.PMTI18n.t(message) : message);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }

  window.addEventListener('pmt:languagechange', () => {
    requiredFields.filter(field => field.getAttribute('aria-invalid') === 'true').forEach(validateField);
  });

  for (const field of requiredFields) {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || submitted || activationRequired) return;

    const invalidFields = requiredFields.filter((field) => !validateField(field));
    if (invalidFields.length) {
      showStatus('请检查标记的项目，填写完整后再提交。', 'error');
      invalidFields[0].focus();
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    for (const key of Object.keys(payload)) payload[key] = String(payload[key]).trim();

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = '正在提交…';
    form.setAttribute('aria-busy', 'true');
    fieldsets.forEach((fieldset) => { fieldset.disabled = true; });
    consent.disabled = true;
    showStatus('正在提交您的需求，请稍候。', 'pending');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/huyun@pmt-array.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('provider-http-error');
      const data = await response.json();
      const providerMessage = String(data?.message || '');
      const needsActivation = /\bnot\s+(?:yet\s+)?activated\b|\bneeds?\s+(?:to\s+be\s+)?activation\b|\bactivat(?:ion\s+(?:e-?mail|link)|e\s+(?:(?:this|your|the)\s+)?(?:form|e-?mail))\b|(?:尚未|未|待|需要|请).{0,12}激活|激活.{0,8}(?:邮件|链接)/i.test(providerMessage);
      if (needsActivation) {
        activationRequired = true;
        submitButton.textContent = '等待邮箱激活';
        newRequestButton.hidden = true;
        showStatus('管理员邮箱尚未完成激活，暂时无法确认需求送达。您的填写内容已保留，请通过“联系我们”直接沟通。', 'pending');
        console.warn('Custom array submission: provider-activation-required');
        status.focus();
        return;
      }
      if (data.success !== true && data.success !== 'true') throw new Error('provider-rejected');

      submitted = true;
      submitButton.textContent = '已提交';
      newRequestButton.hidden = false;
      showStatus('需求已由表单服务接收。我们将通过您填写的联系方式与您沟通。', 'success');
      status.focus();
    } catch (error) {
      const errorCode = error.name === 'AbortError' ? 'request-timeout'
        : ['provider-http-error', 'provider-rejected'].includes(error.message) ? error.message : 'network-or-response-error';
      console.warn(`Custom array submission: ${errorCode}`);
      showStatus(error.name === 'AbortError'
        ? '提交超时，暂时无法确认是否送达。您的填写内容已保留，请稍后重试，或通过“联系我们”直接沟通。'
        : '暂时无法确认提交成功，您的填写内容已保留。请检查网络后重试，或通过“联系我们”直接沟通。', 'error');
      submitButton.textContent = '重新提交';
      status.focus();
    } finally {
      window.clearTimeout(timeoutId);
      submitting = false;
      form.removeAttribute('aria-busy');
      fieldsets.forEach((fieldset) => { fieldset.disabled = submitted; });
      consent.disabled = submitted;
      submitButton.disabled = submitted || activationRequired;
    }
  });

  newRequestButton.addEventListener('click', () => {
    form.reset();
    submitted = false;
    activationRequired = false;
    fieldsets.forEach((fieldset) => { fieldset.disabled = false; });
    consent.disabled = false;
    submitButton.disabled = false;
    submitButton.textContent = '确定提交';
    newRequestButton.hidden = true;
    showStatus('', '');
    requiredFields.forEach((field) => {
      field.setCustomValidity('');
      field.removeAttribute('aria-invalid');
      document.getElementById(`${field.id}-error`).textContent = '';
    });
    requiredFields[0].focus();
  });
})();
