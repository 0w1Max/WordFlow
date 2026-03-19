const path = require('path');
const express = require('express');
const wordsRoutes = require('./routes/wordsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/words', wordsRoutes);
app.use('/api/health', healthRoutes);

module.exports = app;
