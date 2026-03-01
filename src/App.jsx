import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Globe, Brain, TrendingDown, Shield, Target, Crosshair, Bot,
    ChevronRight, ChevronLeft, Check, Lock, BookOpen, Flame, Award,
    BarChart3, Clock, DollarSign, Heart, Skull, Eye, Gauge, Swords,
    ArrowRight, RotateCcw, Sparkles, AlertTriangle, X, Info,
    Download, Upload, Search, Command, Calculator, Terminal
} from 'lucide-react';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'traders-anonymous-state';

const GLOSSARY = {
    'R-multiple': 'Your profit or loss expressed as a multiple of your initial risk. A 2R trade means you made 2x what you risked.',
    'Expectancy': 'The average amount you expect to win (or lose) per trade over time. (Win% × Avg Win) - (Loss% × Avg Loss).',
    'Order flow': 'The real-time stream of buy and sell orders hitting the market. Reveals institutional intent before price moves.',
    'Mean reversion': 'The theory that prices tend to return to their average over time. Extremes snap back.',
    'Delta': 'The net difference between buying and selling volume at each price level. Positive delta = aggressive buyers dominating.',
    'Tape reading': 'Analyzing the raw time & sales data to gauge real-time supply and demand pressure.',
    'Market microstructure': 'How orders are matched, executed, and how liquidity is distributed across price levels.',
};

const BOOT_LINES = [
    { text: '> INITIALIZING LOGIC ENGINE...', delay: 0 },
    { text: '> SCANNING FOR RETAIL EGO...', delay: 400 },
    { text: '> EGO DETECTED. QUARANTINING...', delay: 900 },
    { text: '> LOADING FACTION DATABASE...', delay: 1400 },
    { text: '> CALIBRATING PSYCHOLOGY MODULE...', delay: 1800 },
    { text: '> DISABLING HOPIUM RECEPTORS...', delay: 2200 },
    { text: '> SYSTEM READY. WELCOME TO TRADERS ANONYMOUS.', delay: 2700 },
];

const FACTIONS = {
    scalp: {
        name: 'The Scalp Syndicate',
        desc: 'Masters of the 1-minute chart. You live for order flow and the quick kill.',
        icon: Zap, color: 'emerald',
        traits: ['High time availability', 'Adrenaline-driven', 'Quick execution'],
        strategy: 'Order flow reading, tape analysis, and momentum scalping on 1-min charts.',
    },
    macro: {
        name: 'The Macro Order',
        desc: 'Patient capital. You read the world, not the tape.',
        icon: Globe, color: 'cyan',
        traits: ['High capital', 'Low time commitment', 'Fundamental analysis'],
        strategy: 'Macro fundamentals, daily/weekly trend following, position sizing mastery.',
    },
    algo: {
        name: 'The Algorithm Hive',
        desc: 'Zero emotion. Pure system. You are the machine.',
        icon: Bot, color: 'violet',
        traits: ['Rule-based', 'Systematic', 'Data-driven'],
        strategy: 'Backtested systems, automated entries/exits, statistical edge exploitation.',
    },
    contrarian: {
        name: 'The Contrarian Cult',
        desc: 'You fade the crowd. Mean reversion is your religion.',
        icon: RotateCcw, color: 'amber',
        traits: ['Counter-trend', 'High conviction', 'Patience'],
        strategy: 'Mean reversion setups, sentiment extremes, and value-based entries.',
    },
};

const SKILL_LEVELS = ['Apprentice', 'Journeyman', 'Specialist', 'Architect'];
const SKILL_ICONS = [BookOpen, Flame, Award, Sparkles];

const STEPS = [
    { title: 'Experience & Infrastructure', icon: Shield },
    { title: 'Logistics & Capital', icon: DollarSign },
    { title: 'The Mirror', icon: Brain },
    { title: 'The Confessional', icon: Skull },
];

const BAD_HABITS = [
    { id: 'revenge', label: 'Revenge Trading', icon: Swords },
    { id: 'overlev', label: 'Over-Leveraging', icon: AlertTriangle },
    { id: 'fomo', label: 'FOMO Entries', icon: Eye },
    { id: 'hope', label: '"Hope" Trading', icon: Heart },
    { id: 'nostop', label: 'No Stop Loss', icon: X },
    { id: 'overtrade', label: 'Over-Trading', icon: Gauge },
    { id: 'comfort', label: 'Comfort Addiction', icon: Shield },
    { id: 'movestop', label: 'Moving the Stop', icon: Target },
    { id: 'selflies', label: 'Lying to Yourself', icon: Eye },
];

const QUIZ_DATA = {
    experience: {
        q: 'How long have you been trading?',
        opts: ['< 1 year (Novice)', '1–3 years (Developing)', '3–7 years (Experienced)', '7+ years (Veteran)'],
    },
    broker: {
        q: 'What is your primary broker / toolset?',
        opts: ['ThinkorSwim / TD', 'Interactive Brokers', 'TradingView + Broker', 'Custom / API-based'],
    },
    assets: {
        q: 'Primary asset class?',
        opts: ['Options', 'Futures', 'Forex', 'Crypto', 'Equities'],
    },
    capital: {
        q: 'Capital size?',
        opts: ['Micro (< $5K)', 'Standard ($5K–$50K)', 'Growth ($50K–$250K)', 'Institutional ($250K+)'],
    },
    time: {
        q: 'Time availability?',
        opts: ['Full-time Active Session', 'Part-time (2–4 hours)', 'Set-and-Forget (< 1 hour)', 'Algorithmic / Passive'],
    },
    session: {
        q: 'Preferred trading session?',
        opts: ['London Open', 'New York Session', 'Asian Session', 'Multi-session'],
    },
    style: {
        q: 'Be honest — what are you actually chasing in the market?',
        opts: ['The dopamine hit of a quick scalp', 'The satisfaction of being "right" over days', 'The ego trip of calling a macro move', 'A system that removes me from the equation'],
    },
    drawdown: {
        q: 'Your account is down 15% this month. What does your inner voice say?',
        opts: ['"I need to make it back — NOW."', '"I need to walk away before I do something stupid."', '"Reduce size. Survive. Reassess."', '"It\'s variance. The edge is intact. Stay the course."'],
    },
};

const STEP_FIELDS = [
    ['experience', 'broker', 'assets'],
    ['capital', 'time', 'session'],
    ['style', 'drawdown'],
    ['habits'],
];

// ─── LOGIC ENGINE ────────────────────────────────────────────────────────────
function computeResults(answers, habits = []) {
    const { experience, capital, time, style, drawdown } = answers;
    let skill = 0;
    if (experience >= 1) skill++;
    if (experience >= 2) skill++;
    if (capital >= 2) skill++;
    if (drawdown >= 2) skill++;
    let skillLevel = Math.min(skill, 3);

    const scores = { scalp: 0, macro: 0, algo: 0, contrarian: 0 };
    if (time <= 1) scores.scalp += 3;
    if (time >= 2) scores.macro += 2;
    if (capital <= 1) scores.scalp += 2;
    if (capital >= 2) scores.macro += 3;
    if (style === 0) scores.scalp += 4;
    if (style === 1) scores.contrarian += 3;
    if (style === 2) scores.macro += 4;
    if (style === 3) scores.algo += 5;
    if (drawdown === 3) scores.algo += 3;
    if (drawdown === 2) scores.contrarian += 2;
    if (drawdown === 0) scores.scalp += 1;
    if (drawdown === 1) scores.contrarian += 2;

    const faction = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

    // Conflict detection
    const destructive = ['revenge', 'overlev', 'nostop', 'selflies'].filter(h => habits.includes(h));
    let integrityWarning = null;
    if (skillLevel >= 2 && destructive.length >= 2) {
        integrityWarning = `Your answers say ${SKILL_LEVELS[skillLevel]}, but your confessions say otherwise. We've adjusted your rank — earn it back through The Path.`;
        skillLevel = Math.max(0, skillLevel - 1);
    } else if (habits.length >= 4 && skillLevel >= 1) {
        integrityWarning = `${habits.length} confessions logged. Honesty is the first edge. Your rank reflects where you need to start, not where your ego wants to be.`;
        skillLevel = Math.max(0, skillLevel - 1);
    }

    return { skillLevel, faction, integrityWarning };
}

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
}
function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

// ─── ANIMATION VARIANTS ─────────────────────────────────────────────────────
const pageVariants = {
    enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

// ─── BOOT SEQUENCE ───────────────────────────────────────────────────────────
function BootSequence({ onComplete }) {
    const [lines, setLines] = useState([]);
    useEffect(() => {
        BOOT_LINES.forEach(({ text, delay }) => {
            setTimeout(() => setLines(prev => [...prev, text]), delay);
        });
        setTimeout(onComplete, 3400);
    }, []);
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-lg font-mono text-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Terminal size={18} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">TRADERS_ANONYMOUS v2.0</span>
                </div>
                {lines.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className={`mb-1.5 ${i === lines.length - 1 && i === BOOT_LINES.length - 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {line}
                    </motion.div>
                ))}
                <span className="inline-block w-2 h-4 bg-emerald-400 cursor-blink mt-2" />
            </div>
        </div>
    );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ term }) {
    const [show, setShow] = useState(false);
    const def = GLOSSARY[term];
    if (!def) return null;
    return (
        <span className="relative inline-flex items-center ml-1 align-middle">
            <button onClick={() => setShow(!show)} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
                className="text-slate-500 hover:text-emerald-400 transition-colors"><Info size={12} /></button>
            <AnimatePresence>
                {show && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl glass text-xs text-slate-300 leading-relaxed z-50 glow-emerald">
                        <strong className="text-emerald-400">{term}</strong>: {def}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

// ─── COMMAND PALETTE ─────────────────────────────────────────────────────────
function CommandPalette({ show, onClose, onAction }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const items = [
        { id: 'path', label: 'Go to The Path', icon: Target },
        { id: 'stats', label: 'View Stats', icon: BarChart3 },
        { id: 'confessions', label: 'View Confessions', icon: Skull },
        { id: 'export', label: 'Export Profile', icon: Download },
        { id: 'import', label: 'Import Profile', icon: Upload },
        { id: 'reset', label: 'Reset Profile', icon: RotateCcw },
    ];
    const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
    useEffect(() => { if (show && inputRef.current) inputRef.current.focus(); }, [show]);
    useEffect(() => {
        if (!show) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [show]);
    if (!show) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh]" onClick={onClose}>
            <motion.div initial={{ y: -20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
                className="w-full max-w-md glass rounded-2xl overflow-hidden glow-emerald" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                    <Search size={16} className="text-slate-500" />
                    <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a command..."
                        className="bg-transparent text-sm text-slate-200 outline-none flex-1 font-mono placeholder:text-slate-600" />
                    <kbd className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 font-mono">ESC</kbd>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                    {filtered.map(item => {
                        const Icon = item.icon;
                        return (
                            <button key={item.id} onClick={() => { onAction(item.id); onClose(); setQuery(''); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60 hover:text-emerald-400 transition-all">
                                <Icon size={14} /> {item.label}
                            </button>
                        );
                    })}
                    {filtered.length === 0 && <p className="text-xs text-slate-600 text-center py-4 font-mono">No commands found</p>}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── EXPECTANCY CALCULATOR ───────────────────────────────────────────────────
function ExpectancyCalc() {
    const [wr, setWr] = useState(45);
    const [avgW, setAvgW] = useState(200);
    const [avgL, setAvgL] = useState(100);
    const expectancy = ((wr / 100) * avgW) - ((1 - wr / 100) * avgL);
    const rr = avgL > 0 ? (avgW / avgL).toFixed(2) : '∞';
    return (
        <div className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
                <Calculator size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">EXPECTANCY CALCULATOR</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">WIN RATE %</label>
                    <input type="number" value={wr} onChange={e => setWr(+e.target.value)} min={0} max={100}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">AVG WIN $</label>
                    <input type="number" value={avgW} onChange={e => setAvgW(+e.target.value)} min={0}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-500 font-mono block mb-1">AVG LOSS $</label>
                    <input type="number" value={avgL} onChange={e => setAvgL(+e.target.value)} min={0}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none" />
                </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60">
                <div>
                    <p className="text-[10px] text-slate-500 font-mono">EXPECTANCY</p>
                    <p className={`text-lg font-black font-mono ${expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {expectancy >= 0 ? '+' : ''}{expectancy.toFixed(2)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono">R:R RATIO</p>
                    <p className="text-lg font-black font-mono text-slate-300">{rr}</p>
                </div>
            </div>
            {expectancy < 0 && <p className="text-[10px] text-rose-400/70 mt-2 font-mono">⚠ Negative expectancy. You are paying the market to trade.</p>}
            {expectancy > 0 && <p className="text-[10px] text-emerald-400/70 mt-2 font-mono">✓ Positive edge. Now prove it over 100+ trades.</p>}
        </div>
    );
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function GlassCard({ children, className = '', glow = '', onClick, whileHover, whileTap, ...rest }) {
    return (
        <motion.div
            className={`glass rounded-2xl p-6 ${glow} ${className}`}
            onClick={onClick}
            whileHover={whileHover}
            whileTap={whileTap}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

function ProgressBar({ step, total }) {
    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex justify-between mb-2">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-500 ${i < step ? 'bg-emerald-500 text-slate-950' : i === step ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {i < step ? <Check size={14} /> : i + 1}
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / total) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

function OptionButton({ label, selected, index, onSelect }) {
    return (
        <motion.button
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 font-medium ${selected
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
            onClick={onSelect}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="inline-flex items-center gap-3">
                <span className={`font-mono text-xs w-6 h-6 rounded-md flex items-center justify-center ${selected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}>{index + 1}</span>
                {label}
            </span>
        </motion.button>
    );
}

function HabitPill({ habit, selected, onToggle }) {
    const Icon = habit.icon;
    return (
        <motion.button
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border font-medium text-sm transition-all duration-300 ${selected
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 glow-rose'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
            onClick={onToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            layout
        >
            <Icon size={16} />
            {habit.label}
            {selected && <X size={14} className="ml-1 opacity-60" />}
        </motion.button>
    );
}

// ─── PHASE 1: ENTRY INTERVIEW ───────────────────────────────────────────────
function EntryInterview({ onComplete }) {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [answers, setAnswers] = useState({});
    const [habits, setHabits] = useState([]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter') {
                const fields = STEP_FIELDS[step];
                if (step === 3 && habits.length > 0) { handleSubmit(); return; }
                if (fields.every((f) => f === 'habits' || answers[f] !== undefined)) {
                    if (step < 3) nextStep();
                    else handleSubmit();
                }
            }
            const num = parseInt(e.key);
            if (num >= 1 && num <= 5) {
                const fields = STEP_FIELDS[step].filter((f) => f !== 'habits');
                // Find the first unanswered field in current step
                const field = fields.find((f) => answers[f] === undefined) || fields[fields.length - 1];
                if (field && QUIZ_DATA[field]) {
                    const opts = QUIZ_DATA[field].opts;
                    if (num <= opts.length) {
                        setAnswers((a) => ({ ...a, [field]: num - 1 }));
                    }
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [step, answers, habits]);

    const nextStep = () => { setDir(1); setStep((s) => Math.min(s + 1, 3)); };
    const prevStep = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

    const canAdvance = () => {
        const fields = STEP_FIELDS[step];
        if (step === 3) return habits.length > 0;
        return fields.every((f) => answers[f] !== undefined);
    };

    const handleSubmit = () => {
        if (!canAdvance()) return;
        const results = computeResults(answers, habits);
        onComplete({ answers, habits, ...results });
    };

    const toggleHabit = (id) => {
        setHabits((h) => h.includes(id) ? h.filter((x) => x !== id) : [...h, id]);
    };

    const StepIcon = STEPS[step].icon;

    return (
        <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    Traders Anonymous
                </h1>
                <p className="text-slate-500 font-mono text-sm">THE ENTRY INTERVIEW</p>
            </motion.div>

            <ProgressBar step={step} total={4} />

            <div className="w-full max-w-lg">
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                        <GlassCard className="mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <StepIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-100">{STEPS[step].title}</h2>
                                    <p className="text-xs text-slate-500 font-mono">STEP {step + 1} OF 4</p>
                                </div>
                            </div>

                            {step < 3 ? (
                                <div className="space-y-6">
                                    {STEP_FIELDS[step].map((field) => (
                                        <div key={field}>
                                            <p className="text-sm text-slate-300 mb-3 font-medium">{QUIZ_DATA[field].q}</p>
                                            <div className="space-y-2">
                                                {QUIZ_DATA[field].opts.map((opt, i) => (
                                                    <OptionButton
                                                        key={i}
                                                        label={opt}
                                                        index={i}
                                                        selected={answers[field] === i}
                                                        onSelect={() => setAnswers((a) => ({ ...a, [field]: i }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-slate-300 mb-2 font-medium">Select every single one that applies. All of them. No hedging.</p>
                                    <p className="text-xs text-rose-400/70 mb-5">"The lies you tell yourself in the market are the same ones that keep you losing. Acknowledgment isn't the first step — it's the only step that matters."</p>
                                    <div className="flex flex-wrap gap-3">
                                        {BAD_HABITS.map((h) => (
                                            <HabitPill
                                                key={h.id}
                                                habit={h}
                                                selected={habits.includes(h.id)}
                                                onToggle={() => toggleHabit(h.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={step === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${step === 0 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                            <p className="text-xs text-slate-600 font-mono hidden md:block">
                                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to continue
                                &nbsp;·&nbsp;
                                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">1-5</kbd> to select
                            </p>
                            {step < 3 ? (
                                <motion.button
                                    onClick={nextStep}
                                    disabled={!canAdvance()}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${canAdvance()
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 glow-emerald'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    whileHover={canAdvance() ? { scale: 1.03 } : {}}
                                    whileTap={canAdvance() ? { scale: 0.97 } : {}}
                                >
                                    Continue <ChevronRight size={16} />
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={!canAdvance()}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${canAdvance()
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 glow-emerald'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    whileHover={canAdvance() ? { scale: 1.03 } : {}}
                                    whileTap={canAdvance() ? { scale: 0.97 } : {}}
                                >
                                    Submit <ArrowRight size={16} />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── PHASE 2: FACTION REVEAL ────────────────────────────────────────────────
function FactionReveal({ data, onContinue }) {
    const faction = FACTIONS[data.faction];
    const FactionIcon = faction.icon;
    const SkillIcon = SKILL_ICONS[data.skillLevel];
    const colorMap = { emerald: 'text-emerald-400', cyan: 'text-cyan-400', violet: 'text-violet-400', amber: 'text-amber-400' };
    const bgMap = { emerald: 'bg-emerald-500/10', cyan: 'bg-cyan-500/10', violet: 'bg-violet-500/10', amber: 'bg-amber-500/10' };
    const ringMap = { emerald: 'ring-emerald-500/30', cyan: 'ring-cyan-500/30', violet: 'ring-violet-500/30', amber: 'ring-amber-500/30' };
    const glowMap = { emerald: 'glow-emerald', cyan: 'glow-cyan', violet: 'glow-violet', amber: 'glow-amber' };

    return (
        <div className="min-h-screen bg-grid flex items-center justify-center p-6">
            <motion.div
                className="text-center max-w-md"
                initial="hidden"
                animate="visible"
            >
                {/* Faction Crest */}
                <motion.div className="relative mx-auto mb-8 w-40 h-40" variants={fadeUp} custom={0}>
                    <div className={`absolute inset-0 rounded-full ${bgMap[faction.color]} pulse-ring`} />
                    <div className={`relative w-40 h-40 rounded-full ${bgMap[faction.color]} ring-2 ${ringMap[faction.color]} flex items-center justify-center ${glowMap[faction.color]}`}>
                        <FactionIcon size={64} className={colorMap[faction.color]} />
                    </div>
                </motion.div>

                <motion.p variants={fadeUp} custom={1} className="text-xs font-mono text-slate-500 tracking-widest mb-2">
                    YOU HAVE BEEN ASSIGNED TO
                </motion.p>
                <motion.h1 variants={fadeUp} custom={2} className={`text-3xl md:text-4xl font-black mb-3 ${colorMap[faction.color]}`}>
                    {faction.name}
                </motion.h1>
                <motion.p variants={fadeUp} custom={3} className="text-slate-400 mb-6 leading-relaxed">
                    {faction.desc}
                </motion.p>

                <motion.div variants={fadeUp} custom={4} className="glass rounded-xl p-4 mb-6 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <SkillIcon size={18} className="text-emerald-400" />
                        <span className="text-sm font-bold text-slate-200">Rank: {SKILL_LEVELS[data.skillLevel]}</span>
                    </div>
                    <div className="w-px h-5 bg-slate-700" />
                    <div className="flex gap-1">
                        {faction.traits.map((t, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">{t}</span>
                        ))}
                    </div>
                </motion.div>

                <motion.button
                    variants={fadeUp}
                    custom={5}
                    onClick={onContinue}
                    className={`px-8 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r ${faction.color === 'emerald' ? 'from-emerald-500 to-emerald-400' :
                        faction.color === 'cyan' ? 'from-cyan-500 to-cyan-400' :
                            faction.color === 'violet' ? 'from-violet-500 to-violet-400' :
                                'from-amber-500 to-amber-400'
                        } ${glowMap[faction.color]}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Enter The Path <ArrowRight size={16} className="inline ml-2" />
                </motion.button>
            </motion.div>
        </div>
    );
}

// ─── PHASE 3: DASHBOARD ─────────────────────────────────────────────────────
const CURRICULUM = [
    {
        title: 'Deconstruction',
        subtitle: 'You are your own worst enemy. We start there.',
        icon: Skull,
        locked: false,
        modules: [
            { id: 'rounders', name: 'The Rounders Reckoning', desc: 'Your dopamine system is hijacked. Every "quick hit" scalp, every revenge trade — it\'s the same circuit as addiction. Recovery from the market starts the same way: sit with the discomfort and don\'t self-destruct in response.', type: 'Psychology' },
            { id: 'math', name: 'Math of the Edge', desc: 'Your win rate is a vanity metric.', descFull: 'Expectancy, R-multiples, and the law of large numbers — this is where the lies you tell yourself ("this trade will turn around") die. You are not special. The math doesn\'t care.', type: 'Statistics', interactive: true, tooltips: ['Expectancy', 'R-multiple'] },
            { id: 'bagger', name: 'The Bagger Vance Doctrine', desc: 'You cannot control the Fed, the jobs report, or Mr. Market. You can control your risk, your process, and your response. That\'s not weakness — that\'s wisdom hard-earned. Let the macro noise be what it is.', type: 'Mindset' },
            { id: 'bs', name: 'Calling Your Own BS', desc: '"Just one more trade." "I\'ll move my stop just this once." "I\'m fine." Sound familiar? Recovery teaches you to spot the lies before they cost you everything. This module is about brutal self-honesty — the superpower most traders never develop.', type: 'Psychology' },
        ],
    },
    {
        title: 'The Foundation',
        subtitle: 'Market mechanics for your asset class',
        icon: Target,
        locked: true,
        modules: [
            { id: 'micro', name: 'Market Microstructure', desc: 'How your market actually works — order books, liquidity pools, and price discovery. You can\'t trade what you don\'t understand.', type: 'Mechanics', tooltips: ['Market microstructure', 'Order flow'] },
            { id: 'tape', name: 'Reading the Tape', desc: 'Volume, delta, and the footprint of institutional activity. The tape doesn\'t lie — but you have to learn to listen.', type: 'Analysis', tooltips: ['Delta', 'Tape reading'] },
        ],
    },
    {
        title: 'Faction Specialization',
        subtitle: 'Deep dive into your strategy',
        icon: Crosshair,
        locked: true,
        modules: [
            { id: 'setups', name: 'The Setup Library', desc: 'Battle-tested setups with exact entry, stop, and target criteria. Discipline isn\'t a breakthrough — it\'s showing up every day, especially when you don\'t want to.', type: 'Execution' },
            { id: 'moneyball', name: 'Moneyball Protocol', desc: 'Backtesting your setups and knowing your numbers cold. Fall. Lose. Adapt. Then win.', type: 'Data' },
        ],
    },
    {
        title: 'The Forge',
        subtitle: 'Live execution & the daily practice',
        icon: Flame,
        locked: true,
        modules: [
            { id: 'kings', name: 'The Way of Kings', desc: 'The ritual before every session. Bias, key levels, and a mental state audit. Most traders skip this — most traders lose. Comfort is a trap. Structure is survival.', type: 'Process' },
            { id: 'journal', name: 'The Trade Journal', desc: 'Every trade logged. Every mistake cataloged. Every edge refined. You\'ve already learned how to lose everything and still show up the next day — now we turn that into strategy.', type: 'Review' },
        ],
    },
];

function StatBar({ label, value, max, color, icon: Icon }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                </span>
                <span className="text-xs font-mono text-slate-500">{value}/{max}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                        color === 'rose' ? 'bg-gradient-to-r from-rose-600 to-rose-400' :
                            'bg-gradient-to-r from-cyan-600 to-cyan-400'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                />
            </div>
        </div>
    );
}

function Dashboard({ data, onReset, onExport, onImport, showPalette, setShowPalette }) {
    const faction = FACTIONS[data.faction];
    const FactionIcon = faction.icon;
    const SkillIcon = SKILL_ICONS[data.skillLevel];
    const colorMap = { emerald: 'text-emerald-400', cyan: 'text-cyan-400', violet: 'text-violet-400', amber: 'text-amber-400' };
    const bgMap = { emerald: 'bg-emerald-500/10', cyan: 'bg-cyan-500/10', violet: 'bg-violet-500/10', amber: 'bg-amber-500/10' };
    const glowMap = { emerald: 'glow-emerald', cyan: 'glow-cyan', violet: 'glow-violet', amber: 'glow-amber' };
    const gridClr = { emerald: 'rgba(16,185,129,0.04)', cyan: 'rgba(6,182,212,0.04)', violet: 'rgba(139,92,246,0.04)', amber: 'rgba(245,158,11,0.04)' };
    const [expandedStep, setExpandedStep] = useState(0);
    const [completed, setCompleted] = useState(data.completedModules || []);
    const fileRef = useRef(null);

    const toggleComplete = (modId) => {
        const next = completed.includes(modId) ? completed.filter(c => c !== modId) : [...completed, modId];
        setCompleted(next);
        saveState({ ...data, completedModules: next });
    };

    const totalMods = CURRICULUM.reduce((s, p) => s + p.modules.length, 0);
    const pct = Math.round((completed.length / totalMods) * 100);
    const capitalVal = [15, 40, 70, 95][data.answers?.capital || 0];
    const riskVal = data.answers?.drawdown >= 2 ? 75 : data.answers?.drawdown === 1 ? 55 : 30;
    const mentalVal = Math.max(20, 90 - (data.habits?.length || 0) * 12);

    const handlePA = (id) => {
        if (id === 'export') onExport();
        else if (id === 'import') fileRef.current?.click();
        else if (id === 'reset') onReset();
        else if (id === 'path') setExpandedStep(0);
    };

    const gridStyle = {
        backgroundImage: `linear-gradient(${gridClr[faction.color]} 1px, transparent 1px), linear-gradient(90deg, ${gridClr[faction.color]} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
    };

    return (
        <div className="min-h-screen" style={gridStyle}>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => {
                const f = e.target.files?.[0]; if (!f) return;
                const r = new FileReader();
                r.onload = (ev) => { try { onImport(JSON.parse(ev.target.result)); } catch { } };
                r.readAsText(f); e.target.value = '';
            }} />
            <CommandPalette show={showPalette} onClose={() => setShowPalette(false)} onAction={handlePA} />

            <header className="glass border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${bgMap[faction.color]} flex items-center justify-center`}>
                            <FactionIcon size={16} className={colorMap[faction.color]} />
                        </div>
                        <span className="font-bold text-slate-200 text-sm hidden sm:block">Traders Anonymous</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => setShowPalette(true)} className="text-xs font-mono text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800/50">
                            <Command size={12} /> <span className="hidden sm:inline">Cmd+K</span>
                        </button>
                        <button onClick={onExport} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"><Download size={12} /> <span className="hidden sm:inline">Export</span></button>
                        <button onClick={() => fileRef.current?.click()} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"><Upload size={12} /> <span className="hidden sm:inline">Import</span></button>
                        <button onClick={onReset} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"><RotateCcw size={12} /> <span className="hidden sm:inline">Reset</span></button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                            <GlassCard glow={glowMap[faction.color]}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${bgMap[faction.color]} flex items-center justify-center`}>
                                        <FactionIcon size={28} className={colorMap[faction.color]} />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className={`text-lg font-black ${colorMap[faction.color]}`}>{faction.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <SkillIcon size={12} className="text-emerald-400" />
                                            <span className="text-xs font-mono text-slate-400">{SKILL_LEVELS[data.skillLevel]}</span>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full ${bgMap[faction.color]} flex items-center justify-center`}>
                                        <span className={`text-sm font-black font-mono ${colorMap[faction.color]}`}>{pct}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">{faction.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {faction.traits.map((t, i) => (<span key={i} className={`text-[10px] px-2 py-1 rounded-full ${bgMap[faction.color]} ${colorMap[faction.color]} font-mono`}>{t}</span>))}
                                </div>
                            </GlassCard>
                        </motion.div>

                        {data.integrityWarning && (
                            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
                                <GlassCard glow="glow-rose">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-bold text-rose-400 mb-1">Integrity Check</h3>
                                            <p className="text-xs text-slate-400 leading-relaxed">{data.integrityWarning}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                            <GlassCard>
                                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-slate-500" /> Trader Profile</h3>
                                <StatBar label="Capital" value={capitalVal} max={100} color="emerald" icon={DollarSign} />
                                <StatBar label="Risk Tolerance" value={riskVal} max={100} color="rose" icon={AlertTriangle} />
                                <StatBar label="Mental Capital" value={mentalVal} max={100} color="cyan" icon={Brain} />
                            </GlassCard>
                        </motion.div>

                        {data.habits?.length > 0 && (
                            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                                <GlassCard>
                                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Skull size={14} className="text-rose-400" /> Your Confessions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.habits.map(id => {
                                            const h = BAD_HABITS.find(b => b.id === id); if (!h) return null; const HI = h.icon; return (
                                                <span key={id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono"><HI size={12} /> {h.label}</span>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                            <GlassCard>
                                <h3 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2"><Target size={18} className="text-emerald-400" /> The Path</h3>
                                <p className="text-xs text-slate-500 font-mono mb-6">YOUR PERSONALIZED CURRICULUM · {completed.length}/{totalMods} COMPLETE</p>
                                <div className="relative">
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-slate-700 to-slate-800" />
                                    <div className="space-y-4">
                                        {CURRICULUM.map((phase, idx) => {
                                            const PI = phase.icon; const isExp = expandedStep === idx; const isL = phase.locked;
                                            const pc = phase.modules.filter(m => completed.includes(m.id)).length;
                                            return (
                                                <motion.div key={idx} variants={fadeUp} custom={idx + 2}>
                                                    <button className={`w-full text-left relative pl-14 pr-4 py-4 rounded-xl transition-all duration-300 ${isExp && !isL ? 'bg-slate-800/50 border border-slate-700/50' : 'hover:bg-slate-800/30'} ${isL ? 'opacity-50' : ''}`}
                                                        onClick={() => !isL && setExpandedStep(isExp ? -1 : idx)}>
                                                        <div className={`absolute left-2.5 top-5 w-5 h-5 rounded-lg flex items-center justify-center ${!isL ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                                            {isL ? <Lock size={10} /> : <PI size={12} />}
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-200">Step {idx + 1}: {phase.title}</h4>
                                                                <p className="text-xs text-slate-500 mt-0.5">{phase.subtitle} {!isL && <span className="text-emerald-400/60">({pc}/{phase.modules.length})</span>}</p>
                                                            </div>
                                                            {!isL && <ChevronRight size={14} className={`text-slate-500 transition-transform ${isExp ? 'rotate-90' : ''}`} />}
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {isExp && !isL && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                                <div className="pl-14 pr-4 pb-2 space-y-3">
                                                                    {phase.modules.map((mod, mi) => {
                                                                        const done = completed.includes(mod.id);
                                                                        return (
                                                                            <div key={mi} className={`glass rounded-xl p-4 transition-all ${done ? 'border border-emerald-500/20' : 'glass-hover'}`}>
                                                                                <div className="flex items-start justify-between mb-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <button onClick={() => toggleComplete(mod.id)} className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 border border-slate-700 text-slate-600 hover:border-emerald-500/50'}`}>
                                                                                            {done && <Check size={12} />}
                                                                                        </button>
                                                                                        <h5 className={`text-sm font-semibold ${done ? 'text-emerald-300 line-through opacity-70' : 'text-slate-200'}`}>{mod.name}</h5>
                                                                                    </div>
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono shrink-0">{mod.type}</span>
                                                                                </div>
                                                                                <p className="text-xs text-slate-400 leading-relaxed ml-7">
                                                                                    {mod.descFull || mod.desc}
                                                                                    {mod.tooltips?.map(t => <Tooltip key={t} term={t} />)}
                                                                                </p>
                                                                                {mod.interactive && <div className="ml-7"><ExpectancyCalc /></div>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mt-6">
                            <GlassCard glow={glowMap[faction.color]}>
                                <h3 className={`text-sm font-bold ${colorMap[faction.color]} mb-2 flex items-center gap-2`}><FactionIcon size={16} /> Faction Strategy</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{faction.strategy}</p>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </main>
            <div className="fixed bottom-4 right-4 sm:hidden">
                <button onClick={() => setShowPalette(true)} className={`w-12 h-12 rounded-full ${bgMap[faction.color]} ${glowMap[faction.color]} flex items-center justify-center`}>
                    <Command size={18} className={colorMap[faction.color]} />
                </button>
            </div>
        </div>
    );
}

// ─── APP (Root) ──────────────────────────────────────────────────────────────
export default function App() {
    const [phase, setPhase] = useState('boot');
    const [userData, setUserData] = useState(null);
    const [showPalette, setShowPalette] = useState(false);

    useEffect(() => {
        const saved = loadState();
        if (saved) { setUserData(saved); setPhase('dashboard'); }
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (phase === 'dashboard') setShowPalette(p => !p); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase]);

    const handleExport = () => {
        if (!userData) return;
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'traders-anonymous-profile.json';
        a.click(); URL.revokeObjectURL(url);
    };

    const handleImport = (d) => {
        if (d?.faction && d?.answers) { setUserData(d); saveState(d); setPhase('dashboard'); }
    };

    return (
        <AnimatePresence mode="wait">
            {phase === 'boot' && (
                <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <BootSequence onComplete={() => setPhase('interview')} />
                </motion.div>
            )}
            {phase === 'interview' && (
                <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <EntryInterview onComplete={(d) => { setUserData(d); setPhase('reveal'); }} />
                </motion.div>
            )}
            {phase === 'reveal' && (
                <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <FactionReveal data={userData} onContinue={() => { saveState(userData); setPhase('dashboard'); }} />
                </motion.div>
            )}
            {phase === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <Dashboard data={userData} onReset={() => { clearState(); setUserData(null); setPhase('interview'); }}
                        onExport={handleExport} onImport={handleImport} showPalette={showPalette} setShowPalette={setShowPalette} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

