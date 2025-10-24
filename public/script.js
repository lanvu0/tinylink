// Check if user is logged in (i.e., JWT exists in localStorage)
const token = localStorage.getItem('token');
const shortenSection = document.getElementById('shorten-section');
const logoutButton = document.getElementById('logout-button');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');

if (token) {
  // User is logged in: show shorten form and logout button, hide register/login
  shortenSection.style.display = 'block';
  logoutButton.style.display = 'block';
  registerSection.style.display = 'none';
  loginSection.style.display = 'none';
}

// Register Form
document.getElementById('register-form').addEventListener('submit', async event => {
  event.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const resultElement = document.getElementById('register-result');

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store JWT and update UI
    localStorage.setItem('token', data.token);
    resultElement.textContent = 'Registration successful! You are logged in.';
    resultElement.style.color = 'green';
    shortenSection.style.display = 'block';
    logoutButton.style.display = 'block';
    registerSection.style.display = 'none';
    loginSection.style.display = 'none';
  } catch (error) {
    resultElement.textContent = error.message;
    resultElement.style.color = 'red';
  }
});

// Login Form
document.getElementById('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const resultElement = document.getElementById('login-result');

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store JWT and update UI
    localStorage.setItem('token', data.token);
    resultElement.textContent = 'Login successful!';
    resultElement.style.color = 'green';
    shortenSection.style.display = 'block';
    logoutButton.style.display = 'block';
    registerSection.style.display = 'none';
    loginSection.style.display = 'none';
  } catch (error) {
    resultElement.textContent = error.message;
    resultElement.style.color = 'red';
  }
});

// Shorten URL Form
document.getElementById('shorten-form').addEventListener('submit', async event => {
  event.preventDefault();
  const longUrl = document.getElementById('long-url').value;
  const resultElement = document.getElementById('shorten-result');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:3000/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ longUrl })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Response status: ${response.status}`);
    }

    resultElement.textContent = `Short URL: ${data.shortUrl}`;
    resultElement.style.color = 'green';
  } catch (error) {
    resultElement.textContent = error.message;
    resultElement.style.color = 'red';
  }
});

// Logout Button
document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('token');
  shortenSection.style.display = 'none';
  logoutButton.style.display = 'none';
  registerSection.style.display = 'block';
  loginSection.style.display = 'block';
  document.getElementById('shorten-result').textContent = '';
  document.getElementById('register-result').textContent = '';
  document.getElementById('login-result').textContent = '';
});