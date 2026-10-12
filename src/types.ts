export interface StudentRow {
  name: string;
  email: string;
  branch: string;
  year?: string;
  score: number;
  total?: number;
  rank?: number;
  easy?: number | null;
  medium?: number | null;
  hard?: number | null;
  remarks?: string;
}

export interface EncryptedRecord {
  id: string;
  s: string;  // salt base64
  iv: string; // iv base64
  d: string;  // ciphertext base64
}

export interface QuizMetadata {
  title: string;
  total: number;
  participants: number;
  average: number;
  highest: number;
  releaseAt: string | null;
  sections: {
    easy: number;
    medium: number;
    hard: number;
  };
  branches: string[];
  top: {
    name: string;
    branch: string;
    score: number;
    rank: number;
  }[] | null;
  generatedAt: string;
}

export interface EncryptedDataset {
  v: number;
  salt: string;
  iter: number;
  meta: QuizMetadata;
  records: EncryptedRecord[];
}

export interface DecryptedStudentResult {
  name: string;
  branch: string;
  year?: string;
  score: number;
  total: number;
  rank: number;
  easy?: number | null;
  medium?: number | null;
  hard?: number | null;
  remarks?: string;
}

export interface TierInfo {
  icon: string;
  name: string;
  msg: string;
  colorHex: string;
}
