const router = require('express').Router();
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

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
  const { name, email, shift_start, shift_end, work_days } = req.body;
  if (!name || !email || !shift_start || !shift_end || !work_days?.length) {
    return res.status(400).json({ error: 'name, email, shift_start, shift_end, and work_days are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const { data, error } = await supabase
    .from('employees')
    .insert({ name: name.trim(), email: email.toLowerCase().trim(), shift_start, shift_end, work_days })
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
  const { name, email, shift_start, shift_end, work_days } = req.body;
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
