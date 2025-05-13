
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const app = express();

app.use(cors());
app.use(express.json());

const api = new OpenAI({
  apiKey: process.env.AIML_API_KEY,
  baseURL: "https://api.aimlapi.com/v1"
});

app.post('/api/search-locations', async (req, res) => {
  try {
    const { latitude, longitude, query } = req.body;
    
    if (!process.env.AIML_API_KEY) {
      return res.status(500).json({ error: 'AIML API key not configured' });
    }

    const completion = await api.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides information about nearby aid locations."
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 256
    });

    let suggestions = [];
    try {
      const response = completion.choices[0].message.content;
      suggestions = JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      suggestions = [];
    }

    res.json(suggestions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
