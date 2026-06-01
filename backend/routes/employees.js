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
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/employees — create
router.post('/', async (req, res) => {
  const { name, email, shift_start, work_days } = req.body;
  if (!name || !email || !shift_start || !work_days?.length) {
    return res.status(400).json({ error: 'name, email, shift_start, and work_days are required' });
  }
  const { data, error } = await supabase
    .from('employees')
    .insert({ name, email: email.toLowerCase(), shift_start, work_days })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

// PUT /api/employees/:id — update
router.put('/:id', async (req, res) => {
  const { name, email, shift_start, work_days } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email.toLowerCase();
  if (shift_start) updates.shift_start = shift_start;
  if (work_days) updates.work_days = work_days;

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Employee not found' });
  res.json(data);
});

// DELETE /api/employees/:id — delete
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
