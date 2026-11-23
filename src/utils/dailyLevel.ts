import { MODULES } from '../data/gameData';
import { ModuleMeta } from '../types';

export const DAILY_BONUS_STARS = 5;

export interface DailyChallengeInfo {
  dateKey: string;
  moduleMeta: ModuleMeta;
  bonusStars: number;
}

/**
 * Menghasilkan kunci tanggal lokal YYYY-MM-DD agar pergantian hari sesuai zona waktu perangkat anak.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Memilih 1 modul "Rekomendasi Hari Ini" secara deterministik berdasarkan tanggal lokal,
 * berputar merata melewati seluruh 9 modul pembelajaran.
 */
export function getDailyChallenge(dateKey: string = getLocalDateKey()): DailyChallengeInfo {
  const [yStr, mStr, dStr] = dateKey.split('-');
  const y = Number(yStr) || 2026;
  const m = Number(mStr) || 1;
  const d = Number(dStr) || 1;

  const epochDays = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  const index = ((epochDays % MODULES.length) + MODULES.length) % MODULES.length;

  return {
    dateKey,
    moduleMeta: MODULES[index],
    bonusStars: DAILY_BONUS_STARS,
  };
}
