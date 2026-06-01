require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const supabase = require('./supabase');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to known frontend origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Global rate limit — 200 requests per 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/email', require('./routes/email'));
app.use('/api/leave', require('./routes/leave'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'TimeTrack' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`TimeTrack backend running on port ${PORT}`);

  // Seed first manager from env vars if managers table is empty
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD || '').trim();
  if (!username || !password) return;

  const { data: existing } = await supabase.from('managers').select('id').limit(1);
  if (existing && existing.length > 0) return;

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase.from('managers').insert({
    name: username,
    username,
    password_hash,
  });
  if (error) console.error('Seed manager failed:', error.message);
  else console.log(`First manager seeded: ${username}`);
});
