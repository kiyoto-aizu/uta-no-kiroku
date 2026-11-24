import type { BroadcastRecord } from '@/data/fictional-broadcasts';

export function getSongBroadcasts(records: readonly BroadcastRecord[], songId: string): BroadcastRecord[] {
  return records.filter((record) => record.songId === songId);
}

export function isValidBroadcastDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function searchBroadcasts(
  records: readonly BroadcastRecord[],
  criteria: { title: string; date: string },
): BroadcastRecord[] {
  const query = criteria.title.normalize('NFKC').trim().toLowerCase();
  return records.filter((record) =>
    record.title.normalize('NFKC').toLowerCase().includes(query) &&
    (!criteria.date || record.broadcastDate === criteria.date)
  );
}
