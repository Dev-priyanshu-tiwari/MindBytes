import * as XLSX from 'xlsx';
import { normBranch, normEmail, normHeader } from './crypto';
import { StudentRow } from './types';

export const ALIASES: Record<string, string[]> = {
  name: ['name', 'studentname', 'fullname', 'participantname', 'participant', 'candidatename'],
  email: ['email', 'emailid', 'emailaddress', 'mail', 'mailid'],
  branch: ['branch', 'department', 'dept', 'stream', 'course', 'discipline'],
  year: ['year', 'academicyear', 'yr', 'studyyear', 'classyear'],
  score: ['score', 'marks', 'marksobtained', 'totalscore', 'obtainedmarks', 'finalscore', 'points'],
  easy: ['easy', 'easylevel', 'easyscore', 'sectiona', 'seca'],
  medium: ['medium', 'mediumlevel', 'mediumscore', 'sectionb', 'secb'],
  hard: ['hard', 'hardlevel', 'hardscore', 'sectionc', 'secc'],
  remarks: ['remarks', 'remark', 'note', 'notes', 'feedback'],
};

export const REQUIRED_FIELDS = ['name', 'email', 'branch', 'score'] as const;

export function mapHeaders(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of headers) {
    const n = normHeader(h);
    for (const [k, list] of Object.entries(ALIASES)) {
      if (!map[k] && list.includes(n)) {
        map[k] = h;
        break;
      }
    }
  }
  return map;
}

export const toNum = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export interface ParseResult {
  rows: StudentRow[];
  map: Record<string, string>;
  warnings: string[];
  errors: string[];
  sheetName?: string;
}

export function parseRowsFromData(json: Record<string, unknown>[]): ParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!json || !json.length) {
    return { rows: [], map: {}, warnings, errors: ['The sheet contains no data.'] };
  }

  const map = mapHeaders(Object.keys(json[0]));
  const missing = REQUIRED_FIELDS.filter((k) => !map[k]);
  if (missing.length) {
    errors.push('Missing required column(s): ' + missing.join(', ') + '.');
    return { rows: [], map, warnings, errors };
  }

  const seen = new Set<string>();
  const rows: StudentRow[] = [];

  json.forEach((r, i) => {
    const line = i + 2;
    const name = String(r[map.name] ?? '').trim();
    const email = normEmail(String(r[map.email] ?? ''));
    const branch = String(r[map.branch] ?? '').trim();
    const rawScore = r[map.score];

    if (!name && !email && !branch && (rawScore === '' || rawScore == null)) {
      return; // Skip completely blank row
    }

    if (!name || !email || !branch) {
      warnings.push(`Row ${line}: Name, email, or branch is missing — skipped.`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      warnings.push(`Row ${line}: "${email}" is not a valid email address — skipped.`);
      return;
    }

    const score = toNum(rawScore);
    if (score === null) {
      warnings.push(`Row ${line}: Score "${rawScore}" is not a valid number — skipped.`);
      return;
    }

    const key = email + '|' + normBranch(branch);
    if (seen.has(key)) {
      warnings.push(`Row ${line}: Duplicate participant entry (${email} in ${branch}) — skipped.`);
      return;
    }
    seen.add(key);

    const row: StudentRow = {
      name,
      email,
      branch,
      score,
      year: map.year ? String(r[map.year] ?? '').trim() : '',
      easy: map.easy ? toNum(r[map.easy]) : null,
      medium: map.medium ? toNum(r[map.medium]) : null,
      hard: map.hard ? toNum(r[map.hard]) : null,
      remarks: map.remarks ? String(r[map.remarks] ?? '').trim() : '',
    };

    if (
      typeof row.easy === 'number' &&
      typeof row.medium === 'number' &&
      typeof row.hard === 'number' &&
      Math.abs(row.easy + row.medium + row.hard - score) > 0.001
    ) {
      warnings.push(
        `Row ${line}: Easy (${row.easy}) + Medium (${row.medium}) + Hard (${row.hard}) = ${+(row.easy + row.medium + row.hard).toFixed(2)}, which does not match Score (${score}).`
      );
    }

    rows.push(row);
  });

  if (!rows.length) {
    errors.push('No valid student rows were found in the uploaded file.');
  }

  return { rows, map, warnings, errors };
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const name = wb.SheetNames.find((n) => /result|student|quiz|data/i.test(n)) || wb.SheetNames[0];
    const sheet = wb.Sheets[name];
    if (!sheet) {
      return { rows: [], map: {}, warnings: [], errors: ['No sheet found in workbook.'] };
    }
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    const result = parseRowsFromData(json);
    result.sheetName = name;
    return result;
  } catch (err: unknown) {
    return {
      rows: [],
      map: {},
      warnings: [],
      errors: ['Failed to read spreadsheet file: ' + ((err as Error)?.message || 'Invalid format')],
    };
  }
}

export function generateSampleExcelBlob(): Blob {
  const sampleData = [
    {
      'Student Name': 'Aarav Sharma',
      'Email ID': 'aarav@example.com',
      Branch: 'CSE',
      Year: '2nd Year',
      Score: 46,
      Easy: 20,
      Medium: 19,
      Hard: 7,
      Remarks: 'Excellent performance in AI concepts',
    },
    {
      'Student Name': 'Diya Verma',
      'Email ID': 'diya@example.com',
      Branch: 'IT',
      Year: '3rd Year',
      Score: 44,
      Easy: 19,
      Medium: 18,
      Hard: 7,
      Remarks: 'Great command of LLM fundamentals',
    },
    {
      'Student Name': 'Kabir Singh',
      'Email ID': 'kabir@example.com',
      Branch: 'CSE',
      Year: '4th Year',
      Score: 44,
      Easy: 20,
      Medium: 17,
      Hard: 7,
      Remarks: 'Very strong neural network analysis',
    },
    {
      'Student Name': 'Meera Yadav',
      'Email ID': 'meera@example.com',
      Branch: 'ECE',
      Year: '2nd Year',
      Score: 39,
      Easy: 18,
      Medium: 15,
      Hard: 6,
      Remarks: 'Consistent problem solving',
    },
    {
      'Student Name': 'Rohan Gupta',
      'Email ID': 'rohan@example.com',
      Branch: 'EE',
      Year: '3rd Year',
      Score: 33,
      Easy: 17,
      Medium: 12,
      Hard: 4,
      Remarks: 'Good grasp of core principles',
    },
    {
      'Student Name': 'Ananya Pandey',
      'Email ID': 'ananya@example.com',
      Branch: 'CSE',
      Year: '1st Year',
      Score: 28,
      Easy: 16,
      Medium: 9,
      Hard: 3,
      Remarks: 'Great first year attempt',
    },
    {
      'Student Name': 'Vivaan Mishra',
      'Email ID': 'vivaan@example.com',
      Branch: 'ME',
      Year: '2nd Year',
      Score: 21,
      Easy: 13,
      Medium: 6,
      Hard: 2,
      Remarks: 'Promising engineering problem solving',
    },
    {
      'Student Name': 'Isha Tiwari',
      'Email ID': 'isha@example.com',
      Branch: 'CSE',
      Year: '3rd Year',
      Score: 15,
      Easy: 10,
      Medium: 4,
      Hard: 1,
      Remarks: 'Keep training and experimenting',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MindBytes_Results');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
