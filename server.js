const express = require('express');
const bodyParser = require('body-parser');
import Together from 'together-ai'; // Import the Together module

const together = new Together({ apiKey: '7b82baa0413204685763230c9fa6b8565f5e8b38beeb4211d414e057c5524ddf' });


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

  try {
    // Prepare the request using the Together module
    const completion = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a chatbot developed by Hyperdyn Inc. You are built by Skandan V. If anyone asks are you gpt or chatgpt reply them Im Exynox V4 built in Hyperdyn'
        },
        {
          role: 'user',
          content: userQuery
        }
      ],
    });

    // Extract and cache the response
    const reply = completion.choices[0].message.content;
    responseCache.set(userQuery, reply);

    // Send the response back to our API's client
    res.json({ reply: reply });
  } catch (error) {
    // Log the error for debugging
    console.error('Error calling Together API:', error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
