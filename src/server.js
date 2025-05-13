
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/search-locations', async (req, res) => {
  try {
    const { latitude, longitude, query } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides information about nearby aid locations."
        },
        {
          role: "user",
          content: query
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Parse the AI response and format it as needed
    let suggestions = [];
    try {
      suggestions = JSON.parse(response.data.choices[0].message.content);
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
