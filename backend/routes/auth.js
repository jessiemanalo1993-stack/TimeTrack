const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login — manager login against DB
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const { data: manager, error } = await supabase
    .from('managers')
    .select('id, name, username, password_hash')
    .eq('username', username.trim().toLowerCase())
    .single();

  if (error || !manager) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, manager.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { role: 'admin', manager_id: manager.id, name: manager.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// GET /api/auth/managers — list all managers
router.get('/managers', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('managers')
    .select('id, name, username, created_at')
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/auth/managers — create a new manager
router.post('/managers', authMiddleware, async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('managers')
    .insert({ name: name.trim(), username: username.trim().toLowerCase(), password_hash })
    .select('id, name, username, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

// DELETE /api/auth/managers/:id — delete a manager (cannot delete yourself)
router.delete('/managers/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (String(req.user.manager_id) === String(id)) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const { error } = await supabase.from('managers').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/auth/verify-password — confirm current manager's password
router.post('/verify-password', authMiddleware, loginLimiter, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const { data: manager, error } = await supabase
    .from('managers')
    .select('password_hash')
    .eq('id', req.user.manager_id)
    .single();

  if (error || !manager) return res.status(401).json({ error: 'Manager not found' });

  const valid = await bcrypt.compare(password, manager.password_hash);
  if (!valid) return res.status(401).json({ error: 'Incorrect password' });

  res.json({ verified: true });
});

// POST /api/auth/request-reset — public, send OTP to employee email
router.post('/request-reset', loginLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee) return res.json({ success: true });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from('employees').update({
    reset_otp: otpHash,
    reset_otp_expires: expires,
  }).eq('id', employee.id);

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: process.env.BREVO_FROM_NAME, email: process.env.BREVO_FROM_EMAIL },
      to: [{ name: employee.name, email: employee.email }],
      subject: 'TimeTrack — Password Reset Code',
      htmlContent: `
        <div style="font-family:monospace;max-width:400px;margin:0 auto;padding:24px;">
          <h2 style="font-size:18px;margin-bottom:8px;">TimeTrack</h2>
          <p style="color:#555;margin-bottom:24px;">Password reset requested for your account.</p>
          <div style="border:1px solid #ddd;padding:20px;text-align:center;margin-bottom:24px;">
            <p style="font-size:12px;color:#888;margin:0 0 8px;letter-spacing:0.08em;text-transform:uppercase;">Your reset code</p>
            <p style="font-size:36px;font-weight:700;letter-spacing:0.2em;margin:0;color:#111;">${otp}</p>
            <p style="font-size:12px;color:#888;margin:8px 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="font-size:12px;color:#aaa;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    }, {
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('OTP email send error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to send reset email' });
  }

  res.json({ success: true });
});

// POST /api/auth/reset-password — public, verify OTP and set new password
router.post('/reset-password', loginLimiter, async (req, res) => {
  const { email, otp, new_password } = req.body;
  if (!email || !otp || !new_password) {
    return res.status(400).json({ error: 'email, otp, and new_password are required' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email, reset_otp, reset_otp_expires')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee || !employee.reset_otp) {
    return res.status(400).json({ error: 'Invalid or expired reset code' });
  }

  if (new Date() > new Date(employee.reset_otp_expires)) {
    return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
  }

  const match = await bcrypt.compare(otp, employee.reset_otp);
  if (!match) return res.status(401).json({ error: 'Incorrect reset code' });

  const password_hash = await bcrypt.hash(new_password, 10);
  await supabase.from('employees').update({
    password_hash,
    reset_otp: null,
    reset_otp_expires: null,
  }).eq('id', employee.id);

  res.json({ success: true, name: employee.name });
});

// POST /api/auth/employee-login — employee portal login
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
    const hash = await bcrypt.hash(password, 10);
    await supabase.from('employees').update({ password_hash: hash }).eq('id', employee.id);
  }

  res.json({ name: employee.name, email: employee.email });
});

module.exports = router;
