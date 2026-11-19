document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const studentIdInput = document.getElementById('studentId');
  const fullNameInput = document.getElementById('fullName');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const registerBtn = document.getElementById('registerBtn');
  const btnText = registerBtn.querySelector('.btn-text');
  const spinner = registerBtn.querySelector('.spinner');
  const messageArea = document.getElementById('messageArea');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  const BASE_URL = window.location.origin.startsWith('http')
    ? ''
    : 'http://localhost:3000';

  const REGISTER_URL = `${BASE_URL}/api/register`;
  const STATUS_URL = `${BASE_URL}/api/status`;

  async function checkServerStatus() {
    try {
      const response = await fetch(STATUS_URL, {
        method: 'GET'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        statusDot.className = 'status-dot online';
        statusText.textContent = data.provider === 'supabase' ? 'Supabase Online' : 'System Online';
      } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'System Offline';
      }
    } catch (error) {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Server Offline';
    }
  }

  checkServerStatus();

  function showMessage(text, type = 'error') {
    messageArea.textContent = text;
    messageArea.className = `message-area ${type}`;
    messageArea.classList.remove('hidden');
  }

  function hideMessage() {
    messageArea.textContent = '';
    messageArea.className = 'message-area hidden';
  }

  function setLoading(isLoading) {
    if (isLoading) {
      registerBtn.disabled = true;
      btnText.textContent = 'Registering...';
      spinner.classList.remove('hidden');
    } else {
      registerBtn.disabled = false;
      btnText.textContent = 'Register';
      spinner.classList.add('hidden');
    }
  }

  [studentIdInput, fullNameInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', () => {
      if (!messageArea.classList.contains('hidden') && !messageArea.classList.contains('success')) {
        hideMessage();
      }
    });
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const studentId = studentIdInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!studentId || !fullName || !password || !confirmPassword) {
      showMessage('Please fill in all fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long.', 'warning');
      passwordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      confirmPasswordInput.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          full_name: fullName,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('Registration successful! Redirecting to login...', 'success');
        registerForm.reset();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1800);
      } else {
        showMessage(data.message || 'Registration failed. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Fetch error:', error);
      showMessage(
        'Unable to connect to the server. Please verify the backend is running.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  });
});
