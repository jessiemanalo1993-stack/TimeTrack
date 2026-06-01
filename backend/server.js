require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/email', require('./routes/email'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'TimeTrack' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TimeTrack backend running on port ${PORT}`));
