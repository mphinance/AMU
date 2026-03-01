import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Globe, Brain, TrendingDown, Shield, Target, Crosshair, Bot,
    ChevronRight, ChevronLeft, Check, Lock, BookOpen, Flame, Award,
    BarChart3, Clock, DollarSign, Heart, Skull, Eye, Gauge, Swords,
    ArrowRight, RotateCcw, Sparkles, AlertTriangle, X
} from 'lucide-react';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'traders-anonymous-state';

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
function computeResults(answers) {
    const { experience, capital, time, style, drawdown } = answers;
    // Skill level
    let skill = 0;
    if (experience >= 1) skill++;
    if (experience >= 2) skill++;
    if (capital >= 2) skill++;
    if (drawdown >= 2) skill++;
    const skillLevel = Math.min(skill, 3);

    // Faction scoring
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
    return { skillLevel, faction };
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
        const results = computeResults(answers);
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
            { name: 'Killing the Gambler', desc: 'Your dopamine system is hijacked. Every "quick hit" scalp, every revenge trade — it\'s the same circuit as addiction. Recovery from the market starts the same way: sit with the discomfort and don\'t self-destruct in response.', type: 'Psychology' },
            { name: 'Math of the Edge', desc: 'Your win rate is a vanity metric. Expectancy, R-multiples, and the law of large numbers — this is where the lies you tell yourself ("this trade will turn around") die. You are not special. The math doesn\'t care.', type: 'Statistics' },
            { name: 'The Serenity Principle', desc: 'You cannot control the Fed, the jobs report, or Mr. Market. You can control your risk, your process, and your response. That\'s not weakness — that\'s wisdom hard-earned. Let the macro noise be what it is.', type: 'Mindset' },
            { name: 'Calling Your Own BS', desc: '"Just one more trade." "I\'ll move my stop just this once." "I\'m fine." Sound familiar? Recovery teaches you to spot the lies before they cost you everything. This module is about brutal self-honesty — the superpower most traders never develop.', type: 'Psychology' },
        ],
    },
    {
        title: 'The Foundation',
        subtitle: 'Market mechanics for your asset class',
        icon: Target,
        locked: true,
        modules: [
            { name: 'Market Microstructure', desc: 'How your market actually works — order books, liquidity pools, and price discovery. You can\'t trade what you don\'t understand.', type: 'Mechanics' },
            { name: 'Reading the Tape', desc: 'Volume, delta, and the footprint of institutional activity. The tape doesn\'t lie — but you have to learn to listen.', type: 'Analysis' },
        ],
    },
    {
        title: 'Faction Specialization',
        subtitle: 'Deep dive into your strategy',
        icon: Crosshair,
        locked: true,
        modules: [
            { name: 'The Setup Library', desc: 'Battle-tested setups with exact entry, stop, and target criteria. Discipline isn\'t a breakthrough — it\'s showing up every day, especially when you don\'t want to.', type: 'Execution' },
            { name: 'Edge Quantification', desc: 'Backtesting your setups and knowing your numbers cold. Fall. Lose. Adapt. Then win.', type: 'Data' },
        ],
    },
    {
        title: 'The Forge',
        subtitle: 'Live execution & the daily practice',
        icon: Flame,
        locked: true,
        modules: [
            { name: 'Pre-Market Ritual', desc: 'The ritual before every session. Bias, key levels, and a mental state audit. Most traders skip this — most traders lose. Comfort is a trap. Structure is survival.', type: 'Process' },
            { name: 'The Trade Journal', desc: 'Every trade logged. Every mistake cataloged. Every edge refined. You\'ve already learned how to lose everything and still show up the next day — now we turn that into strategy.', type: 'Review' },
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

function Dashboard({ data, onReset }) {
    const faction = FACTIONS[data.faction];
    const FactionIcon = faction.icon;
    const SkillIcon = SKILL_ICONS[data.skillLevel];
    const colorMap = { emerald: 'text-emerald-400', cyan: 'text-cyan-400', violet: 'text-violet-400', amber: 'text-amber-400' };
    const bgMap = { emerald: 'bg-emerald-500/10', cyan: 'bg-cyan-500/10', violet: 'bg-violet-500/10', amber: 'bg-amber-500/10' };
    const glowMap = { emerald: 'glow-emerald', cyan: 'glow-cyan', violet: 'glow-violet', amber: 'glow-amber' };
    const [expandedStep, setExpandedStep] = useState(0);

    const capitalVal = [15, 40, 70, 95][data.answers?.capital || 0];
    const riskVal = data.answers?.drawdown >= 2 ? 75 : data.answers?.drawdown === 1 ? 55 : 30;
    const mentalVal = Math.max(20, 90 - (data.habits?.length || 0) * 12);

    return (
        <div className="min-h-screen bg-grid">
            {/* Header */}
            <header className="glass border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${bgMap[faction.color]} flex items-center justify-center`}>
                            <FactionIcon size={16} className={colorMap[faction.color]} />
                        </div>
                        <span className="font-bold text-slate-200 text-sm">Traders Anonymous</span>
                    </div>
                    <button
                        onClick={onReset}
                        className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> Reset Profile
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Identity + Stats */}
                    <div className="space-y-6">
                        {/* Identity Card */}
                        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                            <GlassCard glow={glowMap[faction.color]}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${bgMap[faction.color]} flex items-center justify-center`}>
                                        <FactionIcon size={28} className={colorMap[faction.color]} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-black ${colorMap[faction.color]}`}>{faction.name}</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <SkillIcon size={12} className="text-emerald-400" />
                                            <span className="text-xs font-mono text-slate-400">{SKILL_LEVELS[data.skillLevel]}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">{faction.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {faction.traits.map((t, i) => (
                                        <span key={i} className={`text-[10px] px-2 py-1 rounded-full ${bgMap[faction.color]} ${colorMap[faction.color]} font-mono`}>{t}</span>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                            <GlassCard>
                                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                    <BarChart3 size={14} className="text-slate-500" /> Trader Profile
                                </h3>
                                <StatBar label="Capital" value={capitalVal} max={100} color="emerald" icon={DollarSign} />
                                <StatBar label="Risk Tolerance" value={riskVal} max={100} color="rose" icon={AlertTriangle} />
                                <StatBar label="Mental Capital" value={mentalVal} max={100} color="cyan" icon={Brain} />
                            </GlassCard>
                        </motion.div>

                        {/* Confessions */}
                        {data.habits?.length > 0 && (
                            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                                <GlassCard>
                                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                        <Skull size={14} className="text-rose-400" /> Your Confessions
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.habits.map((id) => {
                                            const h = BAD_HABITS.find((b) => b.id === id);
                                            if (!h) return null;
                                            const HIcon = h.icon;
                                            return (
                                                <span key={id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                                                    <HIcon size={12} /> {h.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: The Path */}
                    <div className="lg:col-span-2">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                            <GlassCard>
                                <h3 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
                                    <Target size={18} className="text-emerald-400" /> The Path
                                </h3>
                                <p className="text-xs text-slate-500 font-mono mb-6">YOUR PERSONALIZED CURRICULUM</p>

                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-slate-700 to-slate-800" />

                                    <div className="space-y-4">
                                        {CURRICULUM.map((phase, idx) => {
                                            const PhaseIcon = phase.icon;
                                            const isExpanded = expandedStep === idx;
                                            const isLocked = phase.locked;

                                            return (
                                                <motion.div key={idx} variants={fadeUp} custom={idx + 2}>
                                                    <button
                                                        className={`w-full text-left relative pl-14 pr-4 py-4 rounded-xl transition-all duration-300 ${isExpanded && !isLocked
                                                            ? 'bg-slate-800/50 border border-slate-700/50'
                                                            : 'hover:bg-slate-800/30'
                                                            } ${isLocked ? 'opacity-50' : ''}`}
                                                        onClick={() => !isLocked && setExpandedStep(isExpanded ? -1 : idx)}
                                                    >
                                                        <div className={`absolute left-2.5 top-5 w-5 h-5 rounded-lg flex items-center justify-center ${!isLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                                                            }`}>
                                                            {isLocked ? <Lock size={10} /> : <PhaseIcon size={12} />}
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-200">Step {idx + 1}: {phase.title}</h4>
                                                                <p className="text-xs text-slate-500 mt-0.5">{phase.subtitle}</p>
                                                            </div>
                                                            {!isLocked && (
                                                                <ChevronRight size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                            )}
                                                        </div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isExpanded && !isLocked && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pl-14 pr-4 pb-2 space-y-3">
                                                                    {phase.modules.map((mod, mi) => (
                                                                        <div key={mi} className="glass rounded-xl p-4 glass-hover cursor-pointer transition-all">
                                                                            <div className="flex items-start justify-between mb-1">
                                                                                <h5 className="text-sm font-semibold text-slate-200">{mod.name}</h5>
                                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">{mod.type}</span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
                                                                        </div>
                                                                    ))}
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

                        {/* Faction Strategy */}
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mt-6">
                            <GlassCard glow={glowMap[faction.color]}>
                                <h3 className={`text-sm font-bold ${colorMap[faction.color]} mb-2 flex items-center gap-2`}>
                                    <FactionIcon size={16} /> Faction Strategy
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{faction.strategy}</p>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── APP (Root) ──────────────────────────────────────────────────────────────
export default function App() {
    const [phase, setPhase] = useState('interview'); // interview | reveal | dashboard
    const [userData, setUserData] = useState(null);

    // Load persisted state
    useEffect(() => {
        const saved = loadState();
        if (saved) {
            setUserData(saved);
            setPhase('dashboard');
        }
    }, []);

    const handleQuizComplete = (data) => {
        setUserData(data);
        setPhase('reveal');
    };

    const handleEnterDashboard = () => {
        saveState(userData);
        setPhase('dashboard');
    };

    const handleReset = () => {
        clearState();
        setUserData(null);
        setPhase('interview');
    };

    return (
        <AnimatePresence mode="wait">
            {phase === 'interview' && (
                <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <EntryInterview onComplete={handleQuizComplete} />
                </motion.div>
            )}
            {phase === 'reveal' && (
                <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <FactionReveal data={userData} onContinue={handleEnterDashboard} />
                </motion.div>
            )}
            {phase === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <Dashboard data={userData} onReset={handleReset} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
