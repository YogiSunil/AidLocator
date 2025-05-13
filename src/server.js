
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/search-locations', async (req, res) => {
  try {
    const { latitude, longitude, query } = req.body;
    
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

    const suggestions = JSON.parse(response.data.choices[0].message.content);
    res.json(suggestions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
