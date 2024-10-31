const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Cache to store previously generated responses
const responseCache = new Map();

// Route to handle chat requests
app.post('/chat', async (req, res) => {
  const userQuery = req.body.query;

  // Check if the response for this query is already cached
  if (responseCache.has(userQuery)) {
    const cachedResponse = responseCache.get(userQuery);
    return res.json({ reply: cachedResponse });
  }

  // Prepare the request to the Together API
  const togetherApiUrl = 'https://api.together.xyz/v1/chat/completions';
  const apiKey = '7b82baa0413204685763230c9fa6b8565f5e8b38beeb4211d414e057c5524ddf';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const data = {
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-lora', // Example model, replace with the appropriate model name
    messages: [
      {
        role: 'system',
        content: 'You are a chatbot developed by Hyperdyn Inc. You are built by Skandan V. If anyone asks are you gpt or chatgpt reply them Im Exynox V4 built in Hyperdyn'
      },
      {
        role: 'user',
        content: userQuery
      }
    ]
  };

  try {
    // Send the request to the Together API
    const response = await axios.post(togetherApiUrl, data, { headers });

    // Extract and cache the response
    const completion = response.data.choices[0].message.content;
    responseCache.set(userQuery, completion);

    // Send the response back to our API's client
    res.json({ reply: completion });
  } catch (error) {
    // Log the error for debugging
    console.error('Error calling Together API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
