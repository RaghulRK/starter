require('dotenv-flow').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.send('Authentication service running ✅'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Mongo error:', err));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth Service on port ${PORT}`));
