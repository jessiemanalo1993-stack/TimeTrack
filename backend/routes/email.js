const router = require('express').Router();
const ExcelJS = require('exceljs');
const axios = require('axios');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');
const { todayLocal, formatTime12 } = require('../utils/time');

// POST /api/email/send-report — admin only
router.post('/send-report', authMiddleware, async (req, res) => {
  const { date_from, date_to, employee_id, subject, recipient_id } = req.body;
  const from = date_from || todayLocal();
  const to = date_to || todayLocal();

  // 1. Fetch attendance records
  let attQuery = supabase
    .from('attendance')
    .select('*, employees (id, name, email, shift_start)')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });

  if (employee_id) attQuery = attQuery.eq('employee_id', employee_id);

  const { data: records, error: attError } = await attQuery;
  if (attError) return res.status(500).json({ error: attError.message });
  if (!records.length) return res.status(400).json({ error: 'No attendance records found for the selected range' });

  // 2. Fetch recipients
  let recipientQuery = supabase.from('employees').select('id, name, email');
  if (recipient_id) recipientQuery = recipientQuery.eq('id', recipient_id);

  const { data: employees, error: empError } = await recipientQuery;
  if (empError) return res.status(500).json({ error: empError.message });
  if (!employees.length) return res.status(400).json({ error: 'No employees found' });

  // 3. Build Excel file in memory
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TimeTrack';
  const sheet = workbook.addWorksheet('Attendance');

  sheet.columns = [
    { header: 'Employee Name', key: 'name', width: 24 },
    { header: 'Schedule', key: 'scheduled_start', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Login Time', key: 'time_in', width: 14 },
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
    Present:    { bg: 'FFD1FAE5', font: 'FF065F46' },
    Late:       { bg: 'FFFEF3C7', font: 'FF92400E' },
    Absent:     { bg: 'FFFEE2E2', font: 'FF991B1B' },
    'On Leave': { bg: 'FFE0E7FF', font: 'FF3730A3' },
  };

  records.forEach(record => {
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
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
    });
  });

  // 4. Write workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = buffer.toString('base64');
  const filename = `attendance_${from}_to_${to}.xlsx`;

  // 5. Build HTML email body
  const dateLabel = from === to ? from : `${from} to ${to}`;
  const counts = {
    Present: records.filter(r => r.status === 'Present').length,
    Late: records.filter(r => r.status === 'Late').length,
    Absent: records.filter(r => r.status === 'Absent').length,
    'On Leave': records.filter(r => r.status === 'On Leave').length,
  };

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border:1px solid #e2e2e2;">
    <div style="border-top:3px solid #111111;padding:24px 28px 20px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#999;text-transform:uppercase;font-family:monospace;">TimeTrack</p>
      <h1 style="margin:0;font-size:20px;font-weight:600;color:#111;">${subject || `Attendance Report — ${dateLabel}`}</h1>
    </div>
    <div style="padding:0 28px 20px;border-bottom:1px solid #f0f0f0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          ${[
            { label: 'Present', value: counts.Present, color: '#16a34a' },
            { label: 'Late', value: counts.Late, color: '#d97706' },
            { label: 'Absent', value: counts.Absent, color: '#dc2626' },
            { label: 'On Leave', value: counts['On Leave'], color: '#4338ca' },
          ].map(s => `
            <td style="padding:12px 8px;text-align:center;border:1px solid #f0f0f0;">
              <p style="margin:0 0 4px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">${s.label}</p>
              <p style="margin:0;font-size:28px;font-weight:700;color:${s.color};font-family:monospace;">${s.value}</p>
            </td>
          `).join('')}
        </tr>
      </table>
    </div>
    <div style="padding:20px 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;">
            ${['Employee', 'Schedule', 'Login Time', 'Status', 'Location'].map(h =>
              `<th style="padding:8px 10px;text-align:left;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e2e2e2;font-weight:500;">${h}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${records.map(r => {
            const emp = r.employees || {};
            const statusColor = { Present: '#16a34a', Late: '#d97706', Absent: '#dc2626', 'On Leave': '#4338ca' }[r.status] || '#555';
            const location = r.status === 'On Leave' ? (r.leave_type || 'On Leave') : (r.work_location || '—');
            return `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 10px;font-weight:500;color:#111;">${emp.name || ''}</td>
              <td style="padding:9px 10px;color:#555;font-family:monospace;font-size:12px;">${formatTime12(emp.shift_start)}</td>
              <td style="padding:9px 10px;color:#111;font-family:monospace;font-size:12px;">${formatTime12(r.time_in)}</td>
              <td style="padding:9px 10px;font-weight:600;color:${statusColor};">${r.status}</td>
              <td style="padding:9px 10px;color:#555;">${location}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e2e2e2;">
      <p style="margin:0;font-size:11px;color:#999;font-family:monospace;">The full report is attached as an Excel file.</p>
    </div>
  </div>
</body>
</html>`;

  // 6. Send via Brevo
  const toAddresses = employees.map(e => ({ email: e.email, name: e.name }));
  const emailSubject = subject || `Attendance Report — ${dateLabel}`;
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@example.com';
  const fromName = process.env.BREVO_FROM_NAME || 'TimeTrack';

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: fromEmail, name: fromName },
      to: toAddresses,
      subject: emailSubject,
      htmlContent: emailHtml,
      attachment: [{ name: filename, content: base64 }],
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    res.json({ success: true, sent_to: toAddresses.length, recipients: toAddresses.map(e => e.email) });
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
