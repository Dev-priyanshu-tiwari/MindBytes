import { DecryptedStudentResult, EncryptedDataset, EncryptedRecord, StudentRow, TierInfo } from './types';

export const ITER = 100000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export const normEmail = (s: string | null | undefined): string =>
  String(s ?? '').trim().toLowerCase();

export const normBranch = (s: string | null | undefined): string =>
  String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const normHeader = (s: string | null | undefined): string =>
  String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export const toB64 = (buf: Uint8Array | ArrayBuffer): string => {
  const a = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s);
};

export const fromB64 = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const randB64 = (n: number): string =>
  toB64(crypto.getRandomValues(new Uint8Array(n)));

export async function recordId(fileSalt: string, email: string, branch: string): Promise<string> {
  const data = enc.encode(fileSalt + '|' + normEmail(email) + '|' + normBranch(branch));
  const d = await crypto.subtle.digest('SHA-256', data);
  return toHex(d);
}

export async function deriveKey(
  email: string,
  branch: string,
  saltBytes: Uint8Array,
  iter: number
): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(normEmail(email) + '|' + normBranch(branch)),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes as unknown as ArrayBuffer, iterations: iter, hash: 'SHA-256' },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function sealRecord(fileSalt: string, iter: number, row: StudentRow): Promise<EncryptedRecord> {
  const id = await recordId(fileSalt, row.email, row.branch);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(row.email, row.branch, salt, iter);
  
  const payload = {
    name: row.name,
    branch: row.branch,
    year: row.year || '',
    score: row.score,
    total: row.total,
    rank: row.rank,
    easy: row.easy ?? null,
    medium: row.medium ?? null,
    hard: row.hard ?? null,
    remarks: row.remarks || '',
  };

  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(payload))
  );

  return { id, s: toB64(salt), iv: toB64(iv), d: toB64(ct) };
}

export async function openRecord(
  data: EncryptedDataset,
  email: string,
  branch: string
): Promise<DecryptedStudentResult | null> {
  try {
    const id = await recordId(data.salt, email, branch);
    const rec = data.records.find((r) => r.id === id);
    if (!rec) return null;

    const key = await deriveKey(email, branch, fromB64(rec.s), data.iter);
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromB64(rec.iv) as unknown as ArrayBuffer },
      key,
      fromB64(rec.d) as unknown as ArrayBuffer
    );
    return JSON.parse(dec.decode(pt)) as DecryptedStudentResult;
  } catch {
    return null;
  }
}

export function computeRanks(rows: StudentRow[]): StudentRow[] {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  let rank = 0;
  let prev: number | null = null;
  let n = 0;
  for (const r of sorted) {
    n++;
    if (r.score !== prev) {
      rank = n;
      prev = r.score;
    }
    r.rank = rank;
  }
  return rows;
}

export interface BuildOptions {
  title: string;
  total: number;
  easyMax: number;
  mediumMax: number;
  hardMax: number;
  releaseAt?: string | null;
  showTop?: boolean;
}

export async function buildDataset(
  rows: StudentRow[],
  opts: BuildOptions,
  onProgress?: (current: number, total: number) => void
): Promise<EncryptedDataset> {
  const fileSalt = randB64(16);
  computeRanks(rows);
  const records: EncryptedRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    rows[i].total = opts.total;
    records.push(await sealRecord(fileSalt, ITER, rows[i]));
    if (onProgress) onProgress(i + 1, rows.length);
  }

  // Cryptographic shuffle: ensure file sequence doesn't leak rankings
  for (let i = records.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [records[i], records[j]] = [records[j], records[i]];
  }

  const scores = rows.map((r) => r.score);
  const branchMap = new Map<string, string>();
  rows.forEach((r) => {
    const k = normBranch(r.branch);
    if (!branchMap.has(k)) branchMap.set(k, r.branch);
  });

  const top = opts.showTop
    ? rows
        .filter((r) => (r.rank ?? 999) <= 3)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
        .map((r) => ({
          name: r.name,
          branch: r.branch,
          score: r.score,
          rank: r.rank ?? 1,
        }))
    : null;

  const average = scores.length
    ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : 0;

  return {
    v: 1,
    salt: fileSalt,
    iter: ITER,
    meta: {
      title: opts.title,
      total: opts.total,
      participants: rows.length,
      average,
      highest: scores.length ? Math.max(...scores) : 0,
      releaseAt: opts.releaseAt || null,
      sections: {
        easy: opts.easyMax,
        medium: opts.mediumMax,
        hard: opts.hardMax,
      },
      branches: Array.from(branchMap.values()).sort((a, b) => a.localeCompare(b)),
      top,
      generatedAt: new Date().toISOString(),
    },
    records,
  };
}

export function tierFor(pct: number): TierInfo {
  if (pct >= 90) {
    return {
      icon: '🧠',
      name: 'AGI Material',
      msg: 'Outstanding! You decoded almost everything the quiz threw at you.',
      colorHex: '#3de8ff',
    };
  }
  if (pct >= 75) {
    return {
      icon: '🚀',
      name: 'Neural Navigator',
      msg: 'Brilliant run — you clearly know your way around AI.',
      colorHex: '#00b4ff',
    };
  }
  if (pct >= 60) {
    return {
      icon: '⚡',
      name: 'Prompt Pro',
      msg: 'Solid performance! Your fundamentals are strong.',
      colorHex: '#8b5cf6',
    };
  }
  if (pct >= 40) {
    return {
      icon: '🔧',
      name: 'Model Still Training',
      msg: 'Good effort — a little more practice and you will be unstoppable.',
      colorHex: '#e8b84a',
    };
  }
  return {
    icon: '🌱',
    name: 'Fresh Dataset',
    msg: 'Every great model starts with raw data. Keep learning, keep quizzing!',
    colorHex: '#37e6a0',
  };
}

export const fmt = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '0';
  return Number.isInteger(n) ? String(n) : String(+Number(n).toFixed(2));
};
