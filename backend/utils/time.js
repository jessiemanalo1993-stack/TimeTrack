const TZ = 'Asia/Manila';

function nowLocal() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

function todayLocal() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
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

module.exports = { nowLocal, todayLocal, timeLocal, dayNameLocal, toMinutes, formatTime12 };
