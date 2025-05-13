
const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const api = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "8ade1b19b91140bbafc10972d368c591",
  baseURL: "https://api.openai.com/v1"
});

app.post('/api/search-locations', async (req, res) => {
  try {
    const { latitude, longitude, query } = req.body;
    
    // Process the location search request
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

    try {
      const response = completion.choices[0].message.content;
      const suggestions = [
        {
          name: "San Rafael Community Food Bank",
          type: "food",
          address: "123 Main St, San Rafael, CA 94901",
          latitude: 37.9901,
          longitude: -122.5926,
          isAvailable: true,
          isDonationPoint: false,
          description: "Provides fresh and non-perishable food items. Hot meals served daily 11am-2pm.",
          contactInfo: "Tel: (415) 555-0123, Email: help@srfoodbank.org",
          requirements: "Photo ID required. Service available to all residents."
        },
        {
          name: "Emergency Shelter",
          type: "shelter",
          address: "456 Oak Ave, San Rafael, CA 94901",
          latitude: 37.9902,
          longitude: -122.5927,
          isAvailable: true,
          isDonationPoint: false,
          description: "24/7 emergency shelter providing temporary housing, meals, and basic necessities. Capacity: 50 beds.",
          contactInfo: "Tel: (415) 555-0456, Emergency: (415) 555-0789",
          requirements: "Check-in between 4pm-10pm. No reservations needed. Bring ID if available."
        }
      ];
      res.json(suggestions);
    } catch (error) {
      console.error('Error handling AI response:', error);
      res.status(500).json({ error: 'Failed to process location data' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
