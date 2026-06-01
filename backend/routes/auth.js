const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Strict rate limit on login — 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function timingSafeCompare(a, b) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const validUser = timingSafeCompare(username, process.env.ADMIN_USERNAME || '');
  const validPass = timingSafeCompare(password, process.env.ADMIN_PASSWORD || '');

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// POST /api/auth/employee-login — public, employee login by email + password
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
router.post('/employee-login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee) {
    return res.status(404).json({ error: 'No employee found with that email address' });
  }

  if (employee.password_hash) {
    const match = await bcrypt.compare(password, employee.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
  } else {
    // First use — set password
    const hash = await bcrypt.hash(password, 10);
    await supabase.from('employees').update({ password_hash: hash }).eq('id', employee.id);
  }

  res.json({ name: employee.name, email: employee.email });
});
const authMiddleware = require('../middleware/auth');
router.post('/verify-password', authMiddleware, loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const valid = timingSafeCompare(password, process.env.ADMIN_PASSWORD || '');
  if (!valid) return res.status(401).json({ error: 'Incorrect password' });

  res.json({ verified: true });
});

module.exports = router;
