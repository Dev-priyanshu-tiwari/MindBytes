import {
  ArrowLeft,
  Lock,
  LogOut,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AdminBuilder } from './components/AdminBuilder';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { BinaryBitsBackground } from './components/BinaryBitsBackground';
import { CountdownView } from './components/CountdownView';
import { DecodingTerminal } from './components/DecodingTerminal';
import { HallOfFame } from './components/HallOfFame';
import { KnowviaLogo } from './components/Logos';
import { ResultDisplay } from './components/ResultDisplay';
import { StatsBar } from './components/StatsBar';
import { StudentLookup } from './components/StudentLookup';
import { openRecord } from './crypto';
import { createDefaultDataset } from './data/demoData';
import { DecryptedStudentResult, EncryptedDataset } from './types';

const STORAGE_KEY = 'knowvia_active_dataset';

export default function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('knowvia_admin_auth') === 'true';
  });

  const [dataset, setDataset] = useState<EncryptedDataset | null>(null);

  // Lookup state
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodingLogs, setDecodingLogs] = useState<{ text: string; status?: 'normal' | 'ok' | 'bad' }[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<DecryptedStudentResult | null>(null);

  // Synchronize route & boot dataset (permanently saved data takes precedence)
  useEffect(() => {
    const syncRoute = () => {
      const isHashAdmin = window.location.hash.toLowerCase() === '#admin';
      setActiveTab(isHashAdmin ? 'admin' : 'student');
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);

    // Boot dataset
    async function initData() {
      // 1. First priority: Check permanently saved uploaded dataset from admin
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.v === 1 && Array.isArray(parsed.records)) {
            setDataset(parsed);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to parse saved dataset:', err);
      }

      // 2. Second priority: Check if static results.json file exists
      try {
        const res = await fetch('results.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.v === 1 && Array.isArray(json.records)) {
            setDataset(json);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // 3. Fallback: load initial default dataset only if no uploaded data exists
      const defaultData = await createDefaultDataset();
      setDataset(defaultData);
    }

    initData();
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const handleLookup = async (email: string, branch: string) => {
    if (!dataset) return;

    setLookupError(null);
    setIsDecoding(true);
    setDecodingLogs([]);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    setDecodingLogs([{ text: '> connecting to KNOWVIA mainframe …' }]);
    await sleep(400);

    setDecodingLogs((prev) => [
      ...prev,
      { text: '> hashing credentials   [SHA-256]' },
    ]);
    await sleep(400);

    setDecodingLogs((prev) => [
      ...prev,
      { text: '> deriving key   [PBKDF2 · AES-GCM]' },
    ]);
    await sleep(400);

    setDecodingLogs((prev) => [
      ...prev,
      { text: '> decrypting student record …' },
    ]);
    await sleep(350);

    const decrypted = await openRecord(dataset, email, branch);

    if (decrypted) {
      setDecodingLogs((prev) => [
        ...prev,
        { text: '> access granted  ✓', status: 'ok' },
      ]);
      await sleep(450);
      setIsDecoding(false);
      setCurrentResult(decrypted);
    } else {
      setDecodingLogs((prev) => [
        ...prev,
        { text: '> no matching record  ✗', status: 'bad' },
      ]);
      await sleep(650);
      setIsDecoding(false);
      setLookupError(
        'Could not find a matching result for that email and branch combination. Please check your spelling or contact the KNOWVIA organizing team.'
      );
    }
  };

  const handleExitAdmin = (logout = false) => {
    if (logout) {
      setIsAdminAuthenticated(false);
      sessionStorage.removeItem('knowvia_admin_auth');
    }
    setActiveTab('student');

    // Cleanly remove #admin from the browser URL address bar
    if (window.location.hash) {
      try {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('knowvia_admin_auth', 'true');
  };

  // Called when admin uploads Excel and builds dataset: persists permanently!
  const handlePublishDataset = (newDataset: EncryptedDataset) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDataset));
    } catch (e) {
      console.error('Storage quota exceeded or storage error:', e);
    }
    setDataset(newDataset);
    setCurrentResult(null);
  };

  const handleResetToDemo = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentResult(null);
    const defaultData = await createDefaultDataset();
    setDataset(defaultData);
  };

  // Check if release is locked by a future countdown
  const isCountdownActive =
    dataset?.meta.releaseAt
      ? new Date(dataset.meta.releaseAt).getTime() > Date.now()
      : false;

  return (
    <div className="relative min-h-screen text-[#e9effd] font-body flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background cyber grid & floating binary bits */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0" aria-hidden="true" />
      <BinaryBitsBackground />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12 w-full">
        {/* Header Hero */}
        <header className="text-center pt-2 pb-6">
          {/* Single Official Logo */}
          <div className="flex items-center justify-center mb-5">
            <div className="rounded-full logo-glow-pulse transition-transform hover:scale-105">
              <KnowviaLogo size={118} />
            </div>
          </div>

          <p className="text-xs font-mono font-semibold tracking-widest text-[#3de8ff] uppercase mb-1">
            KNOWVIA · The Quiz Club of CSE
          </p>

          <h1 className="text-5xl sm:text-7xl font-extrabold italic tracking-tight font-head">
            <span className="text-white">Mind</span>
            <span className="text-[#00b4ff] drop-shadow-[0_0_30px_rgba(0,180,255,0.6)]">
              Bytes
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold font-head uppercase tracking-widest text-[#e9effd] mt-2">
            The AI Quiz · Results
          </p>

          <p className="text-lg sm:text-2xl font-bold font-head bg-gradient-to-r from-[#3de8ff] via-[#8b5cf6] to-[#e24bff] bg-clip-text text-transparent mt-1">
            Think. Decode. Discover.
          </p>

          {/* Quiz High Level Metrics */}
          {dataset && <StatsBar meta={dataset.meta} />}
        </header>

        {/* Dedicated Admin Navigation Bar (Visible only when in Admin mode) */}
        {activeTab === 'admin' && (
          <div className="mb-6 p-3 sm:p-4 rounded-xl border border-cyan-400/40 bg-[#091535]/95 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-head font-bold text-sm text-[#e9effd]">
                Organizer Studio Active
              </span>
              <span className="text-xs text-[#8e9fc6] hidden sm:inline">
                · Spreadsheet Encryptor &amp; Settings
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExitAdmin(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#3de8ff] to-[#00b4ff] text-[#04101f] font-head font-bold text-xs hover:shadow-[0_0_20px_rgba(0,180,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Student Portal</span>
              </button>

              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={() => handleExitAdmin(true)}
                  className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-950/60 text-red-300 font-head text-xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Sign out and lock organizer panel"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content View */}
        <main>
          {activeTab === 'admin' ? (
            /* Protected Admin Area */
            isAdminAuthenticated ? (
              <AdminBuilder
                currentDataset={dataset}
                onPublishDataset={handlePublishDataset}
                onExitAdmin={() => handleExitAdmin(false)}
                onResetToDemo={handleResetToDemo}
              />
            ) : (
              <AdminPasscodeModal
                onSuccess={handleAdminAuthSuccess}
                onCancel={() => handleExitAdmin(false)}
              />
            )
          ) : (
            /* Student Result Portal (Default View) */
            <div>
              {isCountdownActive && dataset?.meta.releaseAt ? (
                <CountdownView
                  targetDate={dataset.meta.releaseAt}
                  onUnlocked={() => {
                    setDataset((prev) => (prev ? { ...prev } : null));
                  }}
                />
              ) : isDecoding ? (
                <DecodingTerminal logs={decodingLogs} />
              ) : currentResult && dataset ? (
                <ResultDisplay
                  student={currentResult}
                  dataset={dataset}
                  onReset={() => setCurrentResult(null)}
                />
              ) : dataset ? (
                <StudentLookup
                  dataset={dataset}
                  onLookup={handleLookup}
                  isLoading={isDecoding}
                  error={lookupError}
                  onClearError={() => setLookupError(null)}
                />
              ) : (
                <div className="p-8 text-center bg-[#0d152e]/80 border border-[rgba(110,165,255,0.2)] rounded-2xl">
                  <p className="text-[#8e9fc6]">Initializing MindBytes portal…</p>
                </div>
              )}

              {/* Hall of Fame (Podium) */}
              {dataset?.meta.top && dataset.meta.top.length > 0 && !currentResult && !isDecoding && (
                <HallOfFame topStudents={dataset.meta.top} />
              )}
            </div>
          )}
        </main>

        {/* Clean Student-Facing Footer */}
        <footer className="mt-14 pt-6 border-t border-[rgba(110,165,255,0.15)] text-center text-xs sm:text-sm text-[#8e9fc6] space-y-1.5">
          <p className="font-medium text-[#c0d0f0]">
            KNOWVIA – The Quiz Club of CSE · Institute of Engineering &amp; Technology
          </p>
          <p className="text-xs text-[#8e9fc6]/70">
            Dr. Ram Manohar Lohia Avadh University, Ayodhya, Uttar Pradesh
          </p>
          <div className="pt-3 flex items-center justify-center">
            {/* Discreet coordinator portal lock */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                window.location.hash = '#admin';
              }}
              title="Coordinator Portal"
              className="opacity-20 hover:opacity-80 transition-opacity p-1 text-[#8e9fc6] hover:text-[#3de8ff] cursor-pointer"
              aria-label="Organizer Login"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
