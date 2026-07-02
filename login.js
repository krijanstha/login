const apiUrl = '/api';

const form = document.querySelector('.login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const feedback = document.createElement('div');
feedback.className = 'feedback-message';
form.parentNode.insertBefore(feedback, form.nextSibling);
const toggleModeButton = document.querySelector('.toggle-mode');
const formTitle = document.querySelector('.form-title');
const submitButton = document.querySelector('.btn-primary');
let isRegisterMode = false;

toggleModeButton.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  formTitle.textContent = isRegisterMode ? 'Create a new account' : 'Sign in to your account';
  submitButton.textContent = isRegisterMode ? 'Create Account' : 'Sign In';
  toggleModeButton.textContent = isRegisterMode ? 'Use existing account' : 'Create account';
  feedback.textContent = '';
  feedback.classList.remove('error', 'success');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  feedback.textContent = '';
  feedback.classList.remove('error', 'success');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    feedback.textContent = 'Please enter your email and password.';
    feedback.classList.add('error');
    return;
  }

  const endpoint = isRegisterMode ? 'register' : 'login';
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      feedback.textContent = data.message || 'Unable to process your request.';
      feedback.classList.add('error');
      return;
    }

    if (isRegisterMode) {
      feedback.textContent = 'Account created successfully! Please sign in.';
      feedback.classList.add('success');
      isRegisterMode = false;
      formTitle.textContent = 'Sign in to your account';
      submitButton.textContent = 'Sign In';
      toggleModeButton.textContent = 'Create account';
      emailInput.value = '';
      passwordInput.value = '';
      return;
    }

    window.location.href = 'dashboard.html';
  } catch (error) {
    feedback.textContent = 'Unable to reach the login service.';
    feedback.classList.add('error');
    console.error(error);
  }
});
