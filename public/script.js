document.querySelector('form').addEventListener('submit', async event => {
  event.preventDefault();

  // Get the value from longURL input field
  const longUrl = document.getElementById('long-url').value;
  console.log(longUrl);

  // Make POST request to /shorten endpoint
  const url = 'http://localhost:3000/shorten';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ longUrl })
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const { shortUrl } = await response.json();
    document.getElementById('result').innerText = shortUrl;
  } catch (error) {
    console.error(error.message);
    document.getElementById('result').innerText = error.message;
  }
});