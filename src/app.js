// src/app.js
const express = require('express');
const cors = require('cors');
const dishRoutes = require('./routes/dishRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/dishes', dishRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Error Handler:', err);
  return res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
