const router = require('express').Router();
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');
const { todayLocal } = require('../utils/time');

const ALLOWED_LEAVE_TYPES = ['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'];

// POST /api/leave — public, employee files a leave request
router.post('/', async (req, res) => {
  const { email, password, date, leave_type, reason } = req.body;

  if (!email || !date || !leave_type) {
    return res.status(400).json({ error: 'email, date, and leave_type are required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  if (date < todayLocal()) {
    return res.status(400).json({ error: 'Cannot file leave for a past date' });
  }
  if (!ALLOWED_LEAVE_TYPES.includes(leave_type)) {
    return res.status(400).json({ error: 'Invalid leave type' });
  }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee) {
    return res.status(404).json({ error: 'No employee found with that email address' });
  }

  // Password check
  if (employee.password_hash) {
    const match = await bcrypt.compare(password, employee.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
  } else {
    const hash = await bcrypt.hash(password, 10);
    await supabase.from('employees').update({ password_hash: hash }).eq('id', employee.id);
  }

  // Block if attendance already exists for that date
  const { data: existingAtt } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('employee_id', employee.id)
    .eq('date', date)
    .single();

  if (existingAtt) {
    return res.status(409).json({
      error: `An attendance record already exists for ${date} (${existingAtt.status})`
    });
  }

  // Block duplicate leave request
  const { data: existingLeave } = await supabase
    .from('leave_requests')
    .select('id, status')
    .eq('employee_id', employee.id)
    .eq('date', date)
    .single();

  if (existingLeave) {
    return res.status(409).json({
      error: `A leave request already exists for ${date} (${existingLeave.status})`
    });
  }

  const { data, error } = await supabase
    .from('leave_requests')
    .insert({
      employee_id: employee.id,
      date,
      leave_type,
      reason: reason ? reason.slice(0, 500).trim() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Leave request insert error:', error);
    return res.status(500).json({ error: 'Failed to submit leave request' });
  }

  res.status(201).json({
    id: data.id,
    name: employee.name,
    email: employee.email,
    date: data.date,
    leave_type: data.leave_type,
    status: data.status,
  });
});

// GET /api/leave — admin only, list all requests
router.get('/', authMiddleware, async (req, res) => {
  const { status, employee_id } = req.query;

  let query = supabase
    .from('leave_requests')
    .select('*, employees (id, name, email)')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (status) query = query.eq('status', status);
  if (employee_id) query = query.eq('employee_id', employee_id);

  const { data, error } = await query;
  if (error) {
    console.error('Leave requests fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
  res.json(data);
});

// PUT /api/leave/:id/approve — admin only
router.put('/:id/approve', authMiddleware, async (req, res) => {
  const { data: leave, error: fetchError } = await supabase
    .from('leave_requests')
    .select('*, employees (id, name, email)')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  if (leave.status !== 'Pending') {
    return res.status(409).json({ error: `Leave request is already ${leave.status}` });
  }

  // Check for existing attendance on that day
  const { data: existingAtt } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('employee_id', leave.employee_id)
    .eq('date', leave.date)
    .single();

  if (existingAtt) {
    return res.status(409).json({
      error: `Employee already has an attendance record for ${leave.date} (${existingAtt.status})`
    });
  }

  // Upsert attendance as On Leave
  const { error: attError } = await supabase
    .from('attendance')
    .upsert(
      {
        employee_id: leave.employee_id,
        date: leave.date,
        time_in: null,
        status: 'On Leave',
        leave_type: leave.leave_type,
        notes: leave.reason || null,
      },
      { onConflict: 'employee_id,date' }
    );

  if (attError) {
    console.error('Attendance upsert error on approve:', attError);
    return res.status(500).json({ error: 'Failed to create attendance record' });
  }

  // Update leave request status
  const { data: updated, error: updateError } = await supabase
    .from('leave_requests')
    .update({ status: 'Approved' })
    .eq('id', req.params.id)
    .select('*, employees (id, name, email)')
    .single();

  if (updateError) {
    console.error('Leave request approve error:', updateError);
    return res.status(500).json({ error: 'Failed to approve leave request' });
  }

  res.json(updated);
});

// PUT /api/leave/:id/reject — admin only
router.put('/:id/reject', authMiddleware, async (req, res) => {
  const { data: leave, error: fetchError } = await supabase
    .from('leave_requests')
    .select('id, status')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  if (leave.status !== 'Pending') {
    return res.status(409).json({ error: `Leave request is already ${leave.status}` });
  }

  const { data: updated, error } = await supabase
    .from('leave_requests')
    .update({ status: 'Rejected' })
    .eq('id', req.params.id)
    .select('*, employees (id, name, email)')
    .single();

  if (error) {
    console.error('Leave request reject error:', error);
    return res.status(500).json({ error: 'Failed to reject leave request' });
  }

  res.json(updated);
});

module.exports = router;
