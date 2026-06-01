const router = require('express').Router();
const ExcelJS = require('exceljs');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');
const { todayLocal, yesterdayLocal, timeLocal, dayNameLocal, nowLocal, toMinutes, formatTime12, getShiftWindow } = require('../utils/time');

// POST /api/attendance/timein — public (no auth)
router.post('/timein', async (req, res) => {
  const { email, password, work_location, leave_type } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!password) return res.status(400).json({ error: 'Password is required' });

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

  // Password check
  if (employee.password_hash) {
    const match = await bcrypt.compare(password, employee.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
  } else {
    // First use — set their password
    const hash = await bcrypt.hash(password, 10);
    await supabase.from('employees').update({ password_hash: hash }).eq('id', employee.id);
  }

  const dayName = dayNameLocal();
  if (!employee.work_days.includes(dayName)) {
    return res.status(400).json({ error: `Today (${dayName}) is not a scheduled work day for your account` });
  }

  const nowDT = nowLocal();
  const todayStr = todayLocal();
  const yesterdayStr = yesterdayLocal();

  // Determine which shift window we're currently in
  let shiftDate = null;

  if (!isOnLeave) {
    // Try today's window first
    const todayWindow = getShiftWindow(employee.shift_start, employee.shift_end, todayStr);
    if (nowDT >= todayWindow.windowOpen && nowDT <= todayWindow.windowClose) {
      shiftDate = todayStr;
    } else {
      // Try yesterday's window (covers overnight shifts that started yesterday)
      const yestWindow = getShiftWindow(employee.shift_start, employee.shift_end, yesterdayStr);
      if (nowDT >= yestWindow.windowOpen && nowDT <= yestWindow.windowClose) {
        shiftDate = yesterdayStr;
      }
    }

    if (!shiftDate) {
      // Outside all windows — tell them when the next window opens
      const todayWindow = getShiftWindow(employee.shift_start, employee.shift_end, todayStr);
      const nextOpen = formatTime12(employee.shift_start.slice(0, 5));
      const windowOpenTime = formatTime12(
        `${String(todayWindow.windowOpen.getHours()).padStart(2, '0')}:${String(todayWindow.windowOpen.getMinutes()).padStart(2, '0')}`
      );
      return res.status(400).json({
        error: `You are outside your shift window. Time-in opens at ${windowOpenTime} (30 min before your ${nextOpen} shift start).`
      });
    }
  } else {
    // On Leave — use today's date as shift_date (no window restriction)
    shiftDate = todayStr;
  }

  // Check for existing attendance for this shift
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, time_in, status')
    .eq('employee_id', employee.id)
    .eq('shift_date', shiftDate)
    .single();

  if (existing) {
    return res.status(409).json({
      error: `You have already timed in for this shift at ${formatTime12(existing.time_in)} (${existing.status})`
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
      date: todayStr,
      shift_date: shiftDate,
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
    date: todayStr,
    time_in: timeNow,
    time_in_formatted: formatTime12(timeNow),
    scheduled_start: employee.shift_start,
    scheduled_start_formatted: formatTime12(employee.shift_start),
    scheduled_end_formatted: formatTime12(employee.shift_end),
    status,
    work_location: isOnLeave ? null : work_location,
    leave_type: isOnLeave ? leave_type : null,
  });
});

// POST /api/attendance/timeout — public (no auth)
router.post('/timeout', async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, name, email, shift_start, shift_end, password_hash')
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

  const todayStr = todayLocal();
  const yesterdayStr = yesterdayLocal();

  // Look for an active time-in in today's or yesterday's shift_date
  const { data: records } = await supabase
    .from('attendance')
    .select('id, time_in, time_out, status, date, shift_date')
    .eq('employee_id', employee.id)
    .in('shift_date', [todayStr, yesterdayStr])
    .in('status', ['Present', 'Late'])
    .order('shift_date', { ascending: false })
    .limit(1);

  const record = records?.[0];

  if (!record) {
    return res.status(404).json({ error: 'No active time-in found for your current shift' });
  }

  if (record.time_out) {
    return res.status(409).json({
      error: `You have already timed out at ${formatTime12(record.time_out)}`
    });
  }

  const timeNow = timeLocal();

  const { data: updated, error: updateError } = await supabase
    .from('attendance')
    .update({ time_out: timeNow })
    .eq('id', record.id)
    .select()
    .single();

  if (updateError) {
    console.error('Timeout update error:', updateError);
    return res.status(500).json({ error: 'Failed to record time-out' });
  }

  res.json({
    name: employee.name,
    email: employee.email,
    date: record.date,
    time_in: record.time_in,
    time_in_formatted: formatTime12(record.time_in),
    time_out: timeNow,
    time_out_formatted: formatTime12(timeNow),
    status: record.status,
    scheduled_start_formatted: formatTime12(employee.shift_start),
    scheduled_end_formatted: formatTime12(employee.shift_end),
  });
});

// GET /api/attendance — admin, list records with filters
router.get('/', authMiddleware, async (req, res) => {
  const { date_from, date_to, employee_id } = req.query;
  const from = date_from || todayLocal();
  const to = date_to || todayLocal();

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
      employees (id, name, email, department, shift_start, shift_end, work_days)
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
      { employee_id, date, shift_date: date, time_in: null, status: 'Absent', notes: notes || null },
      { onConflict: 'employee_id,shift_date' }
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
      employees (name, email, department, shift_start, shift_end)
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
    { header: 'Schedule', key: 'scheduled_start', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Login Time', key: 'time_in', width: 14 },
    { header: 'Time Out', key: 'time_out', width: 14 },
    { header: 'Location', key: 'work_location', width: 18 },
    { header: 'Leave Type', key: 'leave_type', width: 18 },
  ];

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
    const scheduleLabel = emp.shift_start && emp.shift_end
      ? `${formatTime12(emp.shift_start)} – ${formatTime12(emp.shift_end)}`
      : formatTime12(emp.shift_start);

    const row = sheet.addRow({
      name: emp.name || '',
      scheduled_start: scheduleLabel,
      status: record.status,
      time_in: formatTime12(record.time_in),
      time_out: formatTime12(record.time_out),
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
