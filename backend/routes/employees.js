const router = require('express').Router();
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

// POST /api/employees/set-password — public, employee sets or changes their own password
router.post('/set-password', async (req, res) => {
  const { email, current_password, new_password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee) {
    return res.status(404).json({ error: 'No employee found with that email address' });
  }

  if (employee.password_hash) {
    if (!current_password) {
      return res.status(400).json({ error: 'Current password is required to change password' });
    }
    const match = await bcrypt.compare(current_password, employee.password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hash = await bcrypt.hash(new_password, 10);
  const { error: updateError } = await supabase
    .from('employees')
    .update({ password_hash: hash })
    .eq('id', employee.id);

  if (updateError) {
    console.error('Set password error:', updateError);
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ success: true, name: employee.name });
});

router.use(authMiddleware);

// GET /api/employees — list all
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Employees fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
  res.json(data);
});

// POST /api/employees — create
router.post('/', async (req, res) => {
  const { name, email, shift_start, shift_end, work_days, password } = req.body;
  if (!name || !email || !shift_start || !shift_end || !work_days?.length) {
    return res.status(400).json({ error: 'name, email, shift_start, shift_end, and work_days are required' });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const insertData = { name: name.trim(), email: email.toLowerCase().trim(), shift_start, shift_end, work_days };
  if (password) insertData.password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('employees')
    .insert(insertData)
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error('Employee create error:', error);
    return res.status(500).json({ error: 'Failed to create employee' });
  }
  res.status(201).json(data);
});

// PUT /api/employees/:id — update
router.put('/:id', async (req, res) => {
  const { name, email, shift_start, shift_end, work_days, password } = req.body;
  const updates = {};
  if (name) updates.name = name.trim();
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    updates.email = email.toLowerCase().trim();
  }
  if (shift_start) updates.shift_start = shift_start;
  if (shift_end) updates.shift_end = shift_end;
  if (work_days) updates.work_days = work_days;
  if (password) {
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    updates.password_hash = await bcrypt.hash(password, 10);
  }

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error('Employee update error:', error);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
  if (!data) return res.status(404).json({ error: 'Employee not found' });
  res.json(data);
});

// DELETE /api/employees/:id — delete
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', req.params.id);
  if (error) {
    console.error('Employee delete error:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
  res.json({ success: true });
});

module.exports = router;
