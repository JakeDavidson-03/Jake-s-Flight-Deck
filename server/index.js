require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/api/flights', async (req, res) => {
  const {
    departure_id,
    arrival_id,
    outbound_date,
    return_date,
    adults = 1,
    stops,
    airline,
    currency = 'USD',
  } = req.query;

  if (!departure_id || !arrival_id || !outbound_date) {
    return res.status(400).json({ error: 'departure_id, arrival_id, and outbound_date are required' });
  }

  const params = {
    engine: 'google_flights',
    departure_id,
    arrival_id,
    outbound_date,
    currency,
    adults,
    api_key: process.env.SERPAPI_KEY,
  };

  if (return_date) params.return_date = return_date;
  if (stops === '0') params.stops = 0;
  if (stops === '1') params.stops = 1;
  if (airline) params.include_airlines = airline;

  try {
    const response = await axios.get('https://serpapi.com/search', { params });
    const data = response.data;

    const results = {
      best_flights: data.best_flights || [],
      other_flights: data.other_flights || [],
      price_insights: data.price_insights || null,
    };

    res.json(results);
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    res.status(500).json({ error: message });
  }
});

app.get('/api/airports', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q is required' });

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_flights',
        departure_id: q,
        arrival_id: 'JFK',
        outbound_date: '2026-06-01',
        api_key: process.env.SERPAPI_KEY,
      },
    });
    res.json(response.data.airports || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
