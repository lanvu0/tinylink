import './style.css';

// Define interfaces for the data we expect from our API
interface AuthApiResponse {
  token: string;
}

interface ShortenApiResponse {
  shortUrl: string;
  shortCode: string;
  longUrl: string;
}

interface StatsApiResponse {
  longUrl: string;
  clickCount: number;
  createdAt: string;
}

interface UserLink {
  short_code: string;
  long_url: string;
  click_count: number;
  created_at: string;
}


// --- DOM Element Selection ---
const shortenSection = document.getElementById('shorten-section');
const logoutButton = document.getElementById('logout-button');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const statsSection = document.getElementById('stats-section');
const statsContent = document.getElementById('stats-content');
const userActions = document.getElementById('user-actions');
const myLinksButton = document.getElementById('my-links-button');
const myLinksSection = document.getElementById('my-links-section');
const myLinksList = document.getElementById('my-links-list');
const shortenForm = document.getElementById('shorten-form');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// --- Helper Function for UI Updates (to avoid repetition) ---
function updateUIVisibility(isLoggedIn: boolean) {
  // Check if elements exist before trying to access their `style` property
  if (shortenSection && userActions && registerSection && loginSection) {
    shortenSection.style.display = isLoggedIn ? 'block' : 'none';
    userActions.style.display = isLoggedIn ? 'block' : 'none';
    registerSection.style.display = isLoggedIn ? 'none' : 'block';
    loginSection.style.display = isLoggedIn ? 'none' : 'block';
  }
}

// --- Helper Function for fetch calls (to avoid repetition) ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  // Set default headers. User-provided headers in options will override these.
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  // If a token exists, automatically add the Authorization header.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Make the actual fetch call
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Attempt to parse the JSON body of the response
  const data = await response.json();

  // If the response was not successful, throw an error with the message from the API
  if (!response.ok) {
    // Check if the API provided a specific error message
    if (data && data.error) {
      throw new Error(data.error);
    }
    // Fallback error message
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  // If successful, return the parsed data
  return data;
}

// --- Initial UI State ---
const token = localStorage.getItem('token');
updateUIVisibility(!!token); // `!!token` converts the string or null into a true/false boolean

// --- Event Listeners ---
// Register Form
registerForm?.addEventListener('submit', async event => {
  event.preventDefault();

  // Use type assertion `as HTMLInputElement` to tell TypeScript these are inputs,
  // so we can safely access their `.value` property.
  const usernameInput = document.getElementById('reg-username') as HTMLInputElement;
  const passwordInput = document.getElementById('reg-password') as HTMLInputElement;
  const resultElement = document.getElementById('register-result');

  // Now we can safely check for null on the result element
  if (!resultElement) return;

  try {
    const data = await apiFetch<AuthApiResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    });

    // Now `data` must have a `token` property.
    localStorage.setItem('token', data.token);
    resultElement.textContent = 'Registration successful! You are logged in.';
    resultElement.style.color = 'green';
    updateUIVisibility(true);

  } catch (error) {
    if (error instanceof Error) {
      resultElement.textContent = error.message;
      resultElement.style.color = 'red';
    }
  }
});

// Login Form
loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const usernameInput = document.getElementById('login-username') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const resultElement = document.getElementById('login-result');

  if (!resultElement) return;

  try {
    const data = await apiFetch<AuthApiResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    });
    
    localStorage.setItem('token', data.token);
    resultElement.textContent = 'Login successful!';
    resultElement.style.color = 'green';
    updateUIVisibility(true);
  } catch (error) {
    if (error instanceof Error) {
      resultElement.textContent = error.message;
      resultElement.style.color = 'red';
    }
  }
});


// Shorten URL Form
shortenForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const longUrlInput = document.getElementById('long-url') as HTMLInputElement;
  const customCodeInput = document.getElementById('custom-code') as HTMLInputElement;
  const resultElement = document.getElementById('shorten-result');

  if (!resultElement || !statsSection || !statsContent) return;
  
  // Clear previous results before making a new request
  resultElement.innerHTML = '';
  statsSection.style.display = 'none';
  
  if (!localStorage.getItem('token')) {
    resultElement.textContent = 'You are not logged in. Please refresh and log in again.';
    return;
  }

  try {
    const data = await apiFetch<ShortenApiResponse>('/shorten', {
      method: 'POST',
      body: JSON.stringify({ 
        longUrl: longUrlInput.value, 
        customCode: customCodeInput.value || undefined 
      })
    });

    const { shortUrl, shortCode } = data;

    // UPDATE the result to include a "View Stats" button
    resultElement.innerHTML = `
      Short URL: <a href="${shortUrl}" target="_blank" rel="noopener noreferrer">${shortUrl}</a>
      <button id="copy-button" style="display: inline-block;">Copy</button>
      <button id="stats-button" data-shortcode="${shortCode}" style="display: inline-block;">View Stats</button>
    `;
    resultElement.style.color = 'green';

    // Add event listener for the copy button
    document.getElementById('copy-button')?.addEventListener('click', () => {
      navigator.clipboard.writeText(shortUrl).then(() => {
        alert('Short URL copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });

    // Add event listener for the stats button
    document.getElementById('stats-button')?.addEventListener('click', async () => {
      try {
        // The apiFetch helper automatically adds the auth token
        const statsData = await apiFetch<StatsApiResponse>(`/stats/${shortCode}`);

        // Populate and show the stats section
        statsContent.innerHTML = `
          <p><strong>Original URL:</strong> ${statsData.longUrl}</p>
          <p><strong>Clicks:</strong> ${statsData.clickCount}</p>
          <p><strong>Created At:</strong> ${new Date(statsData.createdAt).toLocaleString()}</p>
        `;
        statsSection.style.display = 'block';

      } catch (statsError) {
        if (statsError instanceof Error) {
          statsContent.innerHTML = `<p class="error">${statsError.message}</p>`;
          statsSection.style.display = 'block';
        }
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      resultElement.textContent = error.message;
      resultElement.style.color = 'red';
    }
  }
});

myLinksButton?.addEventListener('click', async () => {
  if (!myLinksList || !myLinksSection) return;

  try {
    const links = await apiFetch<UserLink[]>('/my-links');

    // Clear any previous list content
    myLinksList.innerHTML = '';

    if (links.length === 0) {
      myLinksList.innerHTML = '<tr><td colspan="4">You have not created any links yet.</td></tr>';
    } else {
      // Populate the table with the fetched links
      for (const link of links) {
        const row = document.createElement('tr');
        const shortUrl = `${import.meta.env.VITE_API_BASE_URL}/${link.short_code}`;

        row.innerHTML = `
          <td><a href="${shortUrl}" target="_blank">${link.short_code}</a></td>
          <td>${link.long_url}</td>
          <td>${link.click_count}</td>
          <td>${new Date(link.created_at).toLocaleDateString()}</td>
        `;
        myLinksList.appendChild(row);
      }
    }

    // Show the dashboard
    myLinksSection.style.display = 'block';

  } catch (error) {
    if (error instanceof Error) {
      myLinksList.innerHTML = `<tr><td colspan="4" class="error">Failed to load links: ${error.message}</td></tr>`;
      myLinksSection.style.display = 'block';
    }
  }
});

// Logout Button
logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('token');
  updateUIVisibility(false);
  
  // Clear any previous messages
  const resultElements = document.querySelectorAll('#shorten-result, #register-result, #login-result');
  resultElements.forEach(el => {
    if (el) el.textContent = '';
  });
});