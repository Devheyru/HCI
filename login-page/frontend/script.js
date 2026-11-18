document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const spinner = loginBtn.querySelector('.spinner');
  const messageArea = document.getElementById('messageArea');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  const BASE_URL = window.location.origin.startsWith('http')
    ? ''
    : 'http://localhost:3000';

  const LOGIN_URL = `${BASE_URL}/api/login`;
  const STATUS_URL = `${BASE_URL}/api/status`;

  let resetTimer = null;

  async function checkServerStatus() {
    try {
      const response = await fetch(STATUS_URL, {
        method: 'GET'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'System Online';
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
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    messageArea.textContent = text;
    messageArea.className = `message-area ${type}`;
    messageArea.classList.remove('hidden');
  }

  function hideMessage() {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    messageArea.textContent = '';
    messageArea.className = 'message-area hidden';
  }

  function setLoading(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.textContent = 'Verifying...';
      spinner.classList.remove('hidden');
    } else {
      loginBtn.disabled = false;
      btnText.textContent = 'Log In';
      spinner.classList.add('hidden');
    }
  }

  studentIdInput.addEventListener('input', () => {
    if (!messageArea.classList.contains('hidden') && !messageArea.classList.contains('success')) {
      hideMessage();
    }
  });

  passwordInput.addEventListener('input', () => {
    if (!messageArea.classList.contains('hidden') && !messageArea.classList.contains('success')) {
      hideMessage();
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value;

    if (!studentId && !password) {
      showMessage('Please enter your Student ID and Password.', 'warning');
      studentIdInput.focus();
      return;
    }

    if (!studentId) {
      showMessage('Please enter your Student ID.', 'warning');
      studentIdInput.focus();
      return;
    }

    if (!password || password.trim() === '') {
      showMessage('Please enter your Password.', 'warning');
      passwordInput.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const welcome = data.student?.full_name ? ` (Welcome, ${data.student.full_name})` : '';
        showMessage(`${data.message || 'Login successful'}${welcome}`, 'success');
        loginForm.reset();
        resetTimer = setTimeout(() => {
          hideMessage();
          studentIdInput.focus();
        }, 3000);
      } else {
        showMessage(data.message || 'Invalid Student ID or Password', 'error');
      }

    } catch (error) {
      console.error('Fetch error:', error);
      showMessage(
        'Unable to connect to the server. Please verify the backend server is running.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  });
});
