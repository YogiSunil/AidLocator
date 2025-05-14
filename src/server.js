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
  apiKey: "8ade1b19b91140bbafc10972d368c591",
  baseURL: "https://api.aimlapi.com/v1"
});

app.post('/api/search-locations', async (req, res) => {
  try {
    // Removed unused variables 'latitude', 'longitude', 'query', and 'api'

    try {
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
          description: "Provides temporary shelter for individuals and families in need.",
          contactInfo: "Tel: (415) 555-0456, Email: shelter@emergency.org",
          requirements: "No requirements. Open 24/7."
        }
      ];

      res.json(suggestions);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      res.status(500).json({ error: "Failed to parse AI response." });
    }
  } catch (error) {
    console.error("Error processing location search request:", error);
    res.status(500).json({ error: "Failed to process location search request." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
