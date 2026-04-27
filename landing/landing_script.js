const signupEndpoint = (window.WORKABLE_SIGNUP_ENDPOINT || '').trim();
let selectedDonateAmount = '0';

function formatIndianCurrency(value) {
  const amount = Number(value || 0);
  return `Rs ${new Intl.NumberFormat('en-IN').format(amount)}`;
}

function parseIndianAmount(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) {
    return '';
  }

  const compact = raw.replace(/,/g, '').replace(/\s+/g, ' ').trim();
  const match = compact.match(/^(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs)?$/);

  // âœ… FIX: safer handling
  if (!match) {
    return null;
  }

  const numericPart = Number(match[1]);
  if (!Number.isFinite(numericPart) || numericPart < 0) {
    return null;
  }

  const unit = match[2] || '';
  let multiplier = 1;

  if (unit === 'crore' || unit === 'crores' || unit === 'cr') {
    multiplier = 10000000;
  } else if (unit === 'lakh' || unit === 'lakhs' || unit === 'lac' || unit === 'lacs') {
    multiplier = 100000;
  }

  return String(Math.round(numericPart * multiplier));
}

function setSignupStatus(message, type = '') {
  const status = document.getElementById('signupStatus');
  if (!status) return;

  status.textContent = message;
  status.className = 'status-message';
  if (type) {
    status.classList.add(type);
  }
}

async function submitSignup(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  const payload = {
    submittedAt: new Date().toISOString(),
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    institute: String(formData.get('institute') || '').trim(),
    role: String(formData.get('role') || '').trim(),
    message: String(formData.get('message') || '').trim()
  };

  if (!payload.name || !payload.email || !payload.role) {
    setSignupStatus('Please fill in name, email, and role before submitting.', 'error');
    return;
  }

  // âœ… FIX: proper empty check
  if (!signupEndpoint) {
    setSignupStatus('Signup is not configured. Add your Google Apps Script URL in landing.html.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';
  setSignupStatus('Sending your signup...');

  try {
    await fetch(signupEndpoint, {
      method: 'POST',

      // âŒ REMOVED: mode: 'no-cors'
      // âŒ REMOVED: text/plain

      // âœ… FIX:
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(payload)
    });

    form.reset();
    setSignupStatus('Signup submitted successfully.', 'success');

  } catch (error) {
    // âœ… FIX: real debugging
    console.error(error);
    setSignupStatus('Signup failed. Check your endpoint and try again.', 'error');

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Join Waitlist';
  }
}

function scrollToTarget(event) {
  const trigger = event.currentTarget;
  const selector = trigger.getAttribute('data-scroll-target');
  if (!selector) return;

  const target = document.querySelector(selector);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setDonateStatus(message, type = '') {
  const status = document.getElementById('donateStatus');
  if (!status) return;

  status.textContent = message;
  status.className = 'status-message';
  if (type) {
    status.classList.add(type);
  }
}

function updateDonateAmount(amount) {
  const parsed = parseIndianAmount(amount);
  selectedDonateAmount = parsed === null ? '' : parsed;

  const amountLabel = document.getElementById('donateAmountLabel');
  if (amountLabel) {
    amountLabel.textContent = formatIndianCurrency(selectedDonateAmount || '0');
  }

  const amountInput = document.getElementById('donateAmountInput');
  if (amountInput && document.activeElement !== amountInput) {
    if (selectedDonateAmount === '') {
      amountInput.value = '';
    } else {
      amountInput.value = new Intl.NumberFormat('en-IN').format(Number(selectedDonateAmount));
    }
  }

  document.querySelectorAll('.donate-amount').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-amount') === selectedDonateAmount);
  });
}

function handleDummyDonate() {
  const amountInput = document.getElementById('donateAmountInput');
  const typedAmount = amountInput ? amountInput.value.trim() : selectedDonateAmount;

  updateDonateAmount(typedAmount);

  if (selectedDonateAmount === '') {
    setDonateStatus('Enter a valid amount before using the button.', 'error');
    return;
  }

  if (Number(selectedDonateAmount) < 0) {
    setDonateStatus('Enter a valid non-negative amount.', 'error');
    return;
  }

  setDonateStatus(`Dummy checkout opened for ${formatIndianCurrency(selectedDonateAmount)}.`, 'success');
}

function attachInteractions() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', submitSignup);
  }

  document.querySelectorAll('[data-scroll-target]').forEach((element) => {
    element.addEventListener('click', scrollToTarget);
  });

  document.querySelectorAll('.donate-amount').forEach((element) => {
    element.addEventListener('click', () =>
      updateDonateAmount(element.getAttribute('data-amount') || '199')
    );
  });

  const donateAmountInput = document.getElementById('donateAmountInput');
  if (donateAmountInput) {
    donateAmountInput.addEventListener('input', (event) =>
      updateDonateAmount(event.target.value)
    );
    donateAmountInput.addEventListener('blur', (event) =>
      updateDonateAmount(event.target.value)
    );
  }

  const donateButton = document.getElementById('dummyDonateButton');
  if (donateButton) {
    donateButton.addEventListener('click', handleDummyDonate);
  }

  updateDonateAmount(selectedDonateAmount);
}

document.addEventListener('DOMContentLoaded', attachInteractions);