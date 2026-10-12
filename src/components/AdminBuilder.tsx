import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Play,
  RotateCcw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { BuildOptions, buildDataset, fmt } from '../crypto';
import { generateSampleExcelBlob, parseExcelFile, REQUIRED_FIELDS } from '../excelParser';
import { EncryptedDataset, StudentRow } from '../types';

interface AdminBuilderProps {
  currentDataset: EncryptedDataset | null;
  onPublishDataset: (dataset: EncryptedDataset) => void;
  onExitAdmin?: () => void;
  onResetToDemo?: () => void;
}

export const AdminBuilder: React.FC<AdminBuilderProps> = ({
  currentDataset,
  onPublishDataset,
  onExitAdmin,
  onResetToDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<StudentRow[]>([]);
  const [mappedHeaders, setMappedHeaders] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [sheetName, setSheetName] = useState<string>('');

  // Settings
  const [title, setTitle] = useState('MindBytes – The AI Quiz');
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [releaseTime, setReleaseTime] = useState<string>('');
  const [easyMax, setEasyMax] = useState<number>(20);
  const [mediumMax, setMediumMax] = useState<number>(20);
  const [hardMax, setHardMax] = useState<number>(10);
  const [showTop, setShowTop] = useState<boolean>(true);

  // Build state
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptProgress, setEncryptProgress] = useState({ current: 0, total: 0 });
  const [builtDataset, setBuiltDataset] = useState<EncryptedDataset | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  const handleProcessFile = async (file: File) => {
    setBuiltDataset(null);
    setBuildError(null);
    const res = await parseExcelFile(file);
    setMappedHeaders(res.map);
    setWarnings(res.warnings);
    setErrors(res.errors);
    setSheetName(res.sheetName || file.name);

    if (res.rows.length > 0) {
      setParsedRows(res.rows);
      // Auto adjust total marks if student scored higher
      const maxScore = Math.max(...res.rows.map((r) => r.score));
      if (maxScore > totalMarks) {
        setTotalMarks(Math.ceil(maxScore));
      }
    } else {
      setParsedRows([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const blob = generateSampleExcelBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MindBytes_Sample_Template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleBuildDataset = async () => {
    setBuildError(null);
    if (!parsedRows.length) {
      setBuildError('Please upload an Excel or CSV file first.');
      return;
    }
    if (!(totalMarks > 0)) {
      setBuildError('Please enter a valid total marks number.');
      return;
    }

    const overScore = parsedRows.filter((r) => r.score > totalMarks);
    if (overScore.length > 0) {
      setBuildError(
        `${overScore.length} participant(s) have marks exceeding total marks (${overScore[0].name}: ${overScore[0].score} > ${totalMarks}). Please adjust total marks.`
      );
      return;
    }

    setIsEncrypting(true);
    setEncryptProgress({ current: 0, total: parsedRows.length });

    try {
      const opts: BuildOptions = {
        title: title.trim() || 'MindBytes – The AI Quiz',
        total: totalMarks,
        easyMax,
        mediumMax,
        hardMax,
        releaseAt: releaseTime ? new Date(releaseTime).toISOString() : null,
        showTop,
      };

      const rowsCopy = parsedRows.map((r) => ({ ...r }));
      const dataset = await buildDataset(rowsCopy, opts, (cur, tot) => {
        setEncryptProgress({ current: cur, total: tot });
      });

      // Persist permanently into browser storage so data NEVER resets on refresh
      localStorage.setItem('knowvia_active_dataset', JSON.stringify(dataset));
      setBuiltDataset(dataset);
      onPublishDataset(dataset);
    } catch (err: unknown) {
      setBuildError('Encryption failed: ' + ((err as Error)?.message || 'Unknown error'));
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownloadJson = () => {
    if (!builtDataset) return;
    const jsonString = JSON.stringify(builtDataset, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const allColumnsList = ['name', 'email', 'branch', 'score', 'year', 'easy', 'medium', 'hard', 'remarks'];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3de8ff]" />
            <h2 className="text-2xl font-bold font-head text-[#e9effd]">
              Admin · Result Builder &amp; Encryptor
            </h2>
          </div>
          {onExitAdmin && (
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 rounded-lg border border-[rgba(110,165,255,0.3)] bg-white/5 hover:bg-white/10 text-xs font-mono text-[#3de8ff] hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>← Exit to Student Portal</span>
            </button>
          )}
        </div>
        <p className="text-sm text-[#8e9fc6]">
          Upload your students Excel sheet to generate encrypted results. Once uploaded, the dataset is permanently stored and will <b className="text-[#e9effd]">never reset</b> until a new Excel sheet is uploaded here.
        </p>

        {/* Current Active Dataset Status */}
        {currentDataset && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-[#8e9fc6] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Active Dataset Live:
                </span>
                <span className="text-[#e9effd] font-bold font-head text-sm">
                  {currentDataset.meta.title}
                </span>
              </div>
              <p className="text-xs text-[#8e9fc6] mt-1">
                {currentDataset.meta.participants} participants · Top score: {fmt(currentDataset.meta.highest)} · Class average: {fmt(currentDataset.meta.average)} marks
              </p>
            </div>
            {onResetToDemo && localStorage.getItem('knowvia_active_dataset') && (
              <button
                type="button"
                onClick={onResetToDemo}
                className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/50 text-red-300 font-mono text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                title="Purge uploaded data and reset to demo sample"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Sample Data</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step 1: Upload */}
      <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-head text-[#e9effd]">
            1 · Upload Spreadsheet (.xlsx / .csv)
          </h3>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-xs font-mono text-[#3de8ff] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Template (.xlsx)</span>
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#3de8ff] bg-[#00b4ff]/10 scale-[1.01]'
              : 'border-[rgba(110,165,255,0.25)] hover:border-[#3de8ff]/60 bg-[#040816]/60 hover:bg-[#040816]/90'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
            }}
          />
          <div className="inline-flex p-3 rounded-full bg-[#00b4ff]/10 text-[#3de8ff] mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-head font-bold text-base text-[#e9effd]">
            Drop your results file here or click to browse
          </p>
          <p className="text-xs text-[#8e9fc6] mt-1">
            Accepts Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
          </p>
        </div>

        {/* Column Mapping Preview */}
        {sheetName && (
          <div className="mt-5 pt-4 border-t border-[rgba(110,165,255,0.15)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8e9fc6]">
              <FileSpreadsheet className="w-4 h-4 text-[#ffd875]" />
              <span>Sheet: <b>{sheetName}</b> · {parsedRows.length} valid row(s) read</span>
            </div>

            {/* Column Tags */}
            <div className="flex flex-wrap gap-2">
              {allColumnsList.map((col) => {
                const isMapped = !!mappedHeaders[col];
                const isRequired = REQUIRED_FIELDS.includes(col as (typeof REQUIRED_FIELDS)[number]);

                if (isMapped) {
                  return (
                    <span
                      key={col}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-[#37e6a0] font-mono text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{col} ← {mappedHeaders[col]}</span>
                    </span>
                  );
                }

                if (isRequired) {
                  return (
                    <span
                      key={col}
                      className="px-2.5 py-1 rounded-lg bg-red-950/50 border border-red-500/40 text-[#ff5d7a] font-mono text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{col} (Required Missing)</span>
                    </span>
                  );
                }

                return (
                  <span
                    key={col}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#8e9fc6] font-mono text-xs"
                  >
                    {col} (Optional)
                  </span>
                );
              })}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs space-y-1">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                <div className="font-semibold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{warnings.length} warning(s) during parsing:</span>
                </div>
                {warnings.map((warn, i) => (
                  <div key={i}>• {warn}</div>
                ))}
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#3de8ff] font-semibold block mb-2">
                  Preview (Top Candidates by Score)
                </span>
                <div className="overflow-x-auto rounded-xl border border-[rgba(110,165,255,0.2)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#040816] text-[#3de8ff] font-mono border-b border-[rgba(110,165,255,0.2)]">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Branch</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Easy</th>
                        <th className="p-2.5">Medium</th>
                        <th className="p-2.5">Hard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(110,165,255,0.1)] text-[#e9effd]">
                      {[...parsedRows]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 6)
                        .map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-2.5 font-medium">{row.name}</td>
                            <td className="p-2.5 font-mono text-[#8e9fc6]">{row.email}</td>
                            <td className="p-2.5">{row.branch}</td>
                            <td className="p-2.5 font-bold font-mono text-[#ffd875]">{fmt(row.score)}</td>
                            <td className="p-2.5 text-[#8e9fc6]">{fmt(row.easy)}</td>
                            <td className="p-2.5 text-[#8e9fc6]">{fmt(row.medium)}</td>
                            <td className="p-2.5 text-[#8e9fc6]">{fmt(row.hard)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Settings */}
      {parsedRows.length > 0 && (
        <div className="bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-bold font-head text-[#e9effd] mb-4">
            2 · Quiz Settings &amp; Release Schedule
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-1.5 uppercase">
                &gt; QUIZ TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.25)] text-[#e9effd] text-sm focus:outline-none focus:border-[#00b4ff]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-1.5 uppercase">
                  &gt; TOTAL MARKS
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.25)] text-[#e9effd] text-sm focus:outline-none focus:border-[#00b4ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold tracking-wider text-[#3de8ff] mb-1.5 uppercase">
                  &gt; RELEASE TIME (OPTIONAL COUNTDOWN)
                </label>
                <input
                  type="datetime-local"
                  value={releaseTime}
                  onChange={(e) => setReleaseTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.25)] text-[#e9effd] text-sm focus:outline-none focus:border-[#00b4ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#8e9fc6] mb-1">
                  EASY MAX
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={easyMax}
                  onChange={(e) => setEasyMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.2)] text-[#e9effd] text-xs focus:outline-none focus:border-[#00b4ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8e9fc6] mb-1">
                  MEDIUM MAX
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={mediumMax}
                  onChange={(e) => setMediumMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.2)] text-[#e9effd] text-xs focus:outline-none focus:border-[#00b4ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8e9fc6] mb-1">
                  HARD MAX
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={hardMax}
                  onChange={(e) => setHardMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040816]/90 border border-[rgba(110,165,255,0.2)] text-[#e9effd] text-xs focus:outline-none focus:border-[#00b4ff]"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTop}
                onChange={(e) => setShowTop(e.target.checked)}
                className="w-4 h-4 accent-[#00b4ff] rounded cursor-pointer"
              />
              <span className="text-sm text-[#e9effd]">
                Show the Top 3 podium publicly in the “Hall of Fame”
              </span>
            </label>

            {buildError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {buildError}
              </div>
            )}

            <button
              type="button"
              onClick={handleBuildDataset}
              disabled={isEncrypting}
              className="w-full mt-4 py-3.5 px-6 rounded-xl font-head font-bold text-sm sm:text-base text-[#04101f] bg-gradient-to-r from-[#3de8ff] via-[#00b4ff] to-[#8b5cf6] hover:shadow-[0_10px_30px_rgba(0,180,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>
                {isEncrypting
                  ? `Encrypting ${encryptProgress.current} / ${encryptProgress.total}…`
                  : 'Encrypt & Save as Active Live Results'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done & Export */}
      {builtDataset && (
        <div className="bg-[#0d152e]/80 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 text-[#37e6a0]">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-lg font-bold font-head text-[#e9effd]">
              3 · Results Encrypted &amp; Permanently Saved! 🎉
            </h3>
          </div>
          <p className="text-sm text-[#8e9fc6]">
            <b>{builtDataset.records.length}</b> records encrypted and stored. This dataset is now permanently active in the portal and will <b className="text-emerald-400">never reset</b> on page refreshes, until you upload a new Excel file.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="px-5 py-3 rounded-xl font-head font-bold text-sm text-[#04101f] bg-gradient-to-r from-[#3de8ff] to-[#00b4ff] hover:shadow-[0_8px_25px_rgba(0,180,255,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Open in Student Portal Now</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-5 py-3 rounded-xl font-head font-bold text-sm text-[#e9effd] border border-[rgba(110,165,255,0.3)] bg-white/5 hover:bg-white/10 hover:border-[#3de8ff] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download results.json (Backup)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
