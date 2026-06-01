const TZ = 'Asia/Manila';

function nowLocal() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

function todayLocal() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
}

function yesterdayLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', { timeZone: TZ });
}

function timeLocal() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour12: false }); // HH:MM:SS
}

function dayNameLocal() {
  return new Date().toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long' });
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatTime12(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

// Returns true if shift crosses midnight (shift_end is earlier in the day than shift_start)
function isOvernightShift(shiftStart, shiftEnd) {
  return toMinutes(shiftEnd) <= toMinutes(shiftStart);
}

// Build a Date object in Manila local time from a date string (YYYY-MM-DD) and time string (HH:MM or HH:MM:SS)
function buildLocalDate(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  // Use en-US locale construction: create the date as if it's local Manila time
  return new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
}

// Given shift_start (HH:MM), shift_end (HH:MM), and shiftDateStr (YYYY-MM-DD — the date shift_start falls on),
// returns { windowOpen: Date, windowClose: Date }
// windowOpen  = shiftDate at (shift_start − 30 min)
// windowClose = shiftDate at shift_end; if overnight, shift_end is on the NEXT calendar date
function getShiftWindow(shiftStart, shiftEnd, shiftDateStr) {
  const startMins = toMinutes(shiftStart);
  const openMins = startMins - 30;

  // Compute windowOpen date — may roll back to previous calendar day if shift_start < 00:30
  let openDateStr = shiftDateStr;
  let openH, openM;
  if (openMins < 0) {
    // rolls back to previous calendar day
    const [y, mo, d] = shiftDateStr.split('-').map(Number);
    const prev = new Date(y, mo - 1, d - 1);
    openDateStr = prev.toLocaleDateString('en-CA');
    openH = Math.floor((openMins + 1440) / 60);
    openM = (openMins + 1440) % 60;
  } else {
    openH = Math.floor(openMins / 60);
    openM = openMins % 60;
  }

  const windowOpen = buildLocalDate(openDateStr, `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`);

  // Compute windowClose date
  let closeDateStr = shiftDateStr;
  if (isOvernightShift(shiftStart, shiftEnd)) {
    // shift_end falls on the next calendar day
    const [y, mo, d] = shiftDateStr.split('-').map(Number);
    const next = new Date(y, mo - 1, d + 1);
    closeDateStr = next.toLocaleDateString('en-CA');
  }
  const windowClose = buildLocalDate(closeDateStr, shiftEnd);

  return { windowOpen, windowClose };
}

module.exports = { nowLocal, todayLocal, yesterdayLocal, timeLocal, dayNameLocal, toMinutes, formatTime12, isOvernightShift, getShiftWindow };
