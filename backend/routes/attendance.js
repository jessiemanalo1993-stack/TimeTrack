const router = require('express').Router();
const ExcelJS = require('exceljs');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');
const { todayLocal, timeLocal, dayNameLocal, toMinutes, formatTime12 } = require('../utils/time');

// POST /api/attendance/timein — public (no auth)
router.post('/timein', async (req, res) => {
  const { email, work_location, leave_type } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const isOnLeave = work_location === 'On Leave';

  if (!work_location || !['Onsite', 'Work From Home', 'On Leave'].includes(work_location)) {
    return res.status(400).json({ error: 'work_location must be "Onsite", "Work From Home", or "On Leave"' });
  }
  if (isOnLeave && !leave_type) {
    return res.status(400).json({ error: 'leave_type is required when On Leave' });
  }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (empError || !employee) {
    return res.status(404).json({ error: 'No employee found with that email address' });
  }

  const today = todayLocal();
  const dayName = dayNameLocal();

  if (!employee.work_days.includes(dayName)) {
    return res.status(400).json({ error: `Today (${dayName}) is not a scheduled work day for your account` });
  }

  const { data: existing } = await supabase
    .from('attendance')
    .select('id, time_in, status')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single();

  if (existing) {
    return res.status(409).json({
      error: `You have already timed in today at ${formatTime12(existing.time_in)} (${existing.status})`
    });
  }

  const timeNow = timeLocal();
  const nowMins = toMinutes(timeNow);
  const shiftMins = toMinutes(employee.shift_start);
  const status = isOnLeave ? 'On Leave' : (nowMins <= shiftMins ? 'Present' : 'Late');

  const { data: record, error: insertError } = await supabase
    .from('attendance')
    .insert({
      employee_id: employee.id,
      date: today,
      time_in: timeNow,
      status,
      work_location: isOnLeave ? null : work_location,
      leave_type: isOnLeave ? leave_type : null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    return res.status(500).json({ error: 'Failed to record attendance' });
  }

  res.json({
    name: employee.name,
    email: employee.email,
    department: employee.department,
    date: today,
    time_in: timeNow,
    time_in_formatted: formatTime12(timeNow),
    scheduled_start: employee.shift_start,
    scheduled_start_formatted: formatTime12(employee.shift_start),
    status,
    work_location: isOnLeave ? null : work_location,
    leave_type: isOnLeave ? leave_type : null,
  });
});

// GET /api/attendance — admin, list records with filters
router.get('/', authMiddleware, async (req, res) => {
  const { date_from, date_to, employee_id } = req.query;
  const from = date_from || todayLocal();
  const to = date_to || todayLocal();

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  if (from > to) {
    return res.status(400).json({ error: 'date_from must be before date_to' });
  }
  const daysDiff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
  if (daysDiff > 366) {
    return res.status(400).json({ error: 'Date range cannot exceed 366 days' });
  }

  let query = supabase
    .from('attendance')
    .select(`
      *,
      employees (id, name, email, department, shift_start, work_days)
    `)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (employee_id) query = query.eq('employee_id', employee_id);

  const { data, error } = await query;
  if (error) {
    console.error('Attendance fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
  res.json(data);
});

// POST /api/attendance/mark-absent — admin only
router.post('/mark-absent', authMiddleware, async (req, res) => {
  const { employee_id, date, notes } = req.body;
  if (!employee_id || !date) {
    return res.status(400).json({ error: 'employee_id and date are required' });
  }

  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { employee_id, date, time_in: null, status: 'Absent', notes: notes || null },
      { onConflict: 'employee_id,date' }
    )
    .select()
    .single();

  if (error) {
    console.error('Mark absent error:', error);
    return res.status(500).json({ error: 'Failed to mark absent' });
  }
  res.json(data);
});

// DELETE /api/attendance/:id — admin only (remove a record)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', req.params.id);
  if (error) {
    console.error('Attendance delete error:', error);
    return res.status(500).json({ error: 'Failed to delete attendance record' });
  }
  res.json({ success: true });
});

// GET /api/attendance/export — admin only, Excel download
router.get('/export', authMiddleware, async (req, res) => {
  const { date_from, date_to, employee_id } = req.query;
  const from = date_from || todayLocal();
  const to = date_to || todayLocal();

  let query = supabase
    .from('attendance')
    .select(`
      *,
      employees (name, email, department, shift_start)
    `)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (employee_id) query = query.eq('employee_id', employee_id);

  const { data, error } = await query;
  if (error) {
    console.error('Export fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance records' });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TimeTrack';
  const sheet = workbook.addWorksheet('Attendance', {
    pageSetup: { orientation: 'landscape', fitToPage: true }
  });

  sheet.columns = [
    { header: 'Employee Name', key: 'name', width: 24 },
    { header: 'Schedule', key: 'scheduled_start', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Login Time', key: 'time_in', width: 14 },
    { header: 'Location', key: 'work_location', width: 18 },
    { header: 'Leave Type', key: 'leave_type', width: 18 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 22;

  const statusColors = {
    Present:  { bg: 'FFD1FAE5', font: 'FF065F46' },
    Late:     { bg: 'FFFEF3C7', font: 'FF92400E' },
    Absent:   { bg: 'FFFEE2E2', font: 'FF991B1B' },
    'On Leave': { bg: 'FFE0E7FF', font: 'FF3730A3' },
  };

  data.forEach(record => {
    const emp = record.employees || {};

    const row = sheet.addRow({
      name: emp.name || '',
      scheduled_start: formatTime12(emp.shift_start),
      status: record.status,
      time_in: formatTime12(record.time_in),
      work_location: record.work_location || '—',
      leave_type: record.leave_type || '—',
    });

    const colors = statusColors[record.status];
    if (colors) {
      const statusCell = row.getCell('status');
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
      statusCell.font = { bold: true, color: { argb: colors.font } };
    }

    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  });

  const filename = `attendance_${from}_to_${to}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
