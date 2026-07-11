import Head from 'next/head';
import { useEffect, useState } from 'react';
import { motorcycleAA1English } from '../data/lto/motorcycleAA1English';
import { motorcycleAA1EnglishPart2 } from '../data/lto/motorcycleAA1EnglishPart2';
import { motorcycleAA1Tagalog } from '../data/lto/motorcycleAA1Tagalog';
import { motorcycleAA1TagalogPart2 } from '../data/lto/motorcycleAA1TagalogPart2';
import { motorcycleAA1TagalogPart3 } from '../data/lto/motorcycleAA1TagalogPart3';
import { lightVehicleBB1B2Tagalog } from '../data/lto/lightVehicleBB1B2Tagalog';
import { lightVehicleBB1English } from '../data/lto/lightVehicleBB1English';
import { shuffleArray } from '../lib/quizLogic';
import { Question } from '../types/quiz';

type Screen = 'home' | 'selection' | 'quiz' | 'result';
type Reviewer = 'motorcycleEnglish' | 'motorcycleTagalog' | 'lightVehicleEnglish' | 'lightVehicleTagalog';
const letters = ['A', 'B', 'C'];
const QUESTION_SECONDS = 60;
const QUESTION_COUNT = 60;
const PASSING_SCORE = 48;

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [questions, setQuestions] = useState<Question[]>(motorcycleAA1English);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewer, setReviewer] = useState<Reviewer>('motorcycleEnglish');
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const question = questions[current];
  const score = answers.reduce<number>((total, answer, index) => total + (answer === questions[index].correctIndex ? 1 : 0), 0);

  useEffect(() => {
    if (screen !== 'quiz' || timeLeft <= 0) return;
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen !== 'quiz' || timeLeft !== 0) return;
    saveAndAdvance(selected);
    // saveAndAdvance is intentionally triggered only when the timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen]);

  const begin = (selectedReviewer: Reviewer = reviewer) => {
    const bank = selectedReviewer === 'motorcycleTagalog'
      ? [...motorcycleAA1Tagalog, ...motorcycleAA1TagalogPart2, ...motorcycleAA1TagalogPart3]
      : selectedReviewer === 'lightVehicleTagalog'
        ? lightVehicleBB1B2Tagalog
        : selectedReviewer === 'lightVehicleEnglish'
          ? lightVehicleBB1English
          : [...motorcycleAA1English, ...motorcycleAA1EnglishPart2];
    setReviewer(selectedReviewer);
    setQuestions(shuffleArray(bank).slice(0, QUESTION_COUNT));
    setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(QUESTION_SECONDS); setScreen('quiz');
  };
  const saveAndAdvance = (answer: number | null) => {
    setAnswers((previous) => [...previous, answer]);
    if (current === questions.length - 1) setScreen('result');
    else { setCurrent((value) => value + 1); setSelected(null); setTimeLeft(QUESTION_SECONDS); }
  };
  const next = () => { if (selected !== null) saveAndAdvance(selected); };
  const background = screen === 'quiz' || screen === 'result' ? '/images/lto_background.webp' : '/images/lto_landing_background.webp';

  return <><Head><title>LTO Driving License Reviewer</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></Head>
    <main className="min-h-screen bg-[#0649ad] text-white" style={{ backgroundImage: `linear-gradient(rgba(4,49,132,.62),rgba(4,49,132,.78)),url('${background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <Header />
      {screen === 'home' && <Welcome onContinue={() => setScreen('selection')} />}
      {screen === 'selection' && <Selection onStart={begin} onBack={() => setScreen('home')} />}
      {screen === 'quiz' && <Quiz question={question} index={current} total={questions.length} selected={selected} timeLeft={timeLeft} onSelect={setSelected} onNext={next} onExit={() => setScreen('selection')} />}
      {screen === 'result' && <Results score={score} total={questions.length} questions={questions} answers={answers} onRetry={() => begin(reviewer)} onHome={() => setScreen('home')} />}
    </main>
  </>;
}

function Header() { return <header className="border-b border-blue-300/25 bg-[#0348ac]/95 shadow-lg"><div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-7"><div className="flex min-w-0 items-center gap-3"><img src="/images/lto_logo.webp" alt="LTO logo" className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" /><div><p className="text-base font-semibold tracking-tight sm:text-xl">Driving License Reviewer</p><p className="mt-0.5 text-[10px] font-medium tracking-wide text-blue-200 sm:text-xs">Practice for Code A and A1</p></div></div></div></header>; }

function Welcome({ onContinue }: { onContinue: () => void }) { return <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl items-center px-4 py-6 sm:py-10"><div className="lto-view w-full overflow-hidden rounded-3xl border border-white/30 bg-[#0b55b8]/85 shadow-2xl backdrop-blur-sm"><div className="flex min-h-[560px] flex-col items-center justify-center px-6 py-12 text-center"><p className="text-sm font-medium tracking-wide text-blue-100 sm:text-lg">Welcome to</p><img src="/images/lto_logo.webp" alt="Land Transportation Office" className="lto-float my-5 h-28 w-28 object-contain drop-shadow-lg sm:h-36 sm:w-36" /><h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">LTO Driving License Reviewer</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-50 sm:text-xl">Focused, timed practice for motorcycle driving rules, safety, and road signs.</p><button onClick={onContinue} className="lto-primary mt-9 min-h-12 rounded-xl px-8 py-3 text-base font-semibold text-white">Continue <span aria-hidden="true">→</span></button><p className="mt-8 max-w-xl text-xs leading-relaxed text-blue-100">Independent study tool. This is not the official LTMS portal or an official LTO examination.</p></div></div></section>; }

function Selection({ onStart, onBack }: { onStart: (reviewer: Reviewer) => void; onBack: () => void }) { return <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl items-center px-4 py-7 sm:py-10"><div className="lto-view w-full rounded-3xl border border-white/30 bg-[#064cac]/90 p-5 shadow-2xl backdrop-blur sm:p-10"><button onClick={onBack} className="mb-6 text-sm font-medium text-blue-100 transition hover:text-white">← Back to home</button><div className="mb-8 text-center"><p className="text-sm font-medium tracking-wide text-blue-200">Choose a reviewer</p><h2 className="mt-2 text-3xl font-semibold sm:text-5xl">Start your practice</h2></div><div className="grid gap-4 md:grid-cols-2"><ReviewerCard reviewer="motorcycleEnglish" title="Motorcycle" code="Code A / A1" language="English" onStart={onStart} /><ReviewerCard reviewer="motorcycleTagalog" title="Motorcycle" code="Code A / A1" language="Tagalog" onStart={onStart} /><ReviewerCard reviewer="lightVehicleEnglish" title="Light Vehicle" code="Code B / B1" language="English" onStart={onStart} /><ReviewerCard reviewer="lightVehicleTagalog" title="Light Vehicle" code="Code B, B1, B2" language="Tagalog" onStart={onStart} /></div></div></section>; }

function ReviewerCard({ reviewer, title, code, language, onStart }: { reviewer: Reviewer; title: string; code: string; language: string; onStart: (reviewer: Reviewer) => void }) { return <button onClick={() => onStart(reviewer)} className="lto-start-card group rounded-2xl border-2 border-white bg-white p-6 text-left text-slate-900 shadow-lg"><span className="inline-flex rounded-full bg-[#064cac] px-3 py-1 text-xs font-semibold text-white">Available now</span><h3 className="mt-4 text-2xl font-semibold">{title}</h3><p className="mt-1 text-lg font-semibold text-[#064cac]">{code}</p><p className="mt-3 text-sm leading-relaxed text-slate-600">{language} · 60 random questions · Passing score: 48</p><span className="lto-start-button mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white">Start reviewer <span className="text-lg">→</span></span></button>; }

function Quiz({ question, index, total, selected, timeLeft, onSelect, onNext, onExit }: { question: Question; index: number; total: number; selected: number | null; timeLeft: number; onSelect: (index: number) => void; onNext: () => void; onExit: () => void }) { const seconds = `${timeLeft % 60}`.padStart(2, '0'); return <section className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8"><div className="overflow-hidden rounded-xl border border-blue-100 bg-white text-slate-900 shadow-2xl"><div className="flex items-center justify-between gap-3 bg-[#0649ad] px-4 py-3 text-white sm:px-7"><p className="font-semibold">Questions: <span className="text-lg">{index + 1}</span> <span className="font-medium text-blue-100">out of</span> {total}</p><div className="flex items-center gap-3"><span className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${timeLeft <= 10 ? 'animate-pulse bg-red-500' : 'bg-blue-800'}`}><ClockIcon />0:{seconds}</span><p className="hidden text-lg font-semibold sm:block">Code A, A1</p></div></div><div key={index} className="lto-question"><div className="border-b border-slate-300 p-3 sm:p-5"><div className="min-h-28 border border-slate-300 p-4 sm:p-6"><span className="block text-sm text-slate-600">Question</span><h2 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">{question.question}</h2></div></div><div className={`grid ${question.image ? 'lg:grid-cols-[330px_1fr]' : ''}`}>{question.image && <div className="flex items-center justify-center border-b border-slate-300 bg-slate-50 p-6 lg:border-b-0 lg:border-r"><img src={question.image} alt="Traffic sign for this question" className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" /></div>}<div>{question.options.map((option, optionIndex) => <button key={option} onClick={() => onSelect(optionIndex)} className={`lto-answer flex w-full items-center gap-5 border-b border-slate-300 px-5 py-5 text-left text-lg font-medium sm:px-10 sm:py-6 sm:text-2xl ${selected === optionIndex ? 'bg-[#c9e9a5] ring-2 ring-inset ring-[#65a839]' : 'hover:bg-blue-50'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${selected === optionIndex ? 'bg-[#5aa431] text-white' : 'bg-slate-100 text-slate-700'}`}>{letters[optionIndex]}</span><span>{option}</span></button>)}</div></div></div><div className="flex items-center justify-between gap-4 p-4 sm:px-8"><button onClick={onExit} className="font-medium text-slate-500 transition hover:text-[#0649ad]">Exit reviewer</button><button onClick={onNext} disabled={selected === null} className="rounded-lg bg-[#084daf] px-6 py-2.5 text-base font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#063e91] disabled:cursor-not-allowed disabled:bg-slate-300">{index === total - 1 ? 'Finish' : 'Next'} →</button></div></div></section>; }

function Results({ score, total, questions, answers, onRetry, onHome }: { score: number; total: number; questions: Question[]; answers: (number | null)[]; onRetry: () => void; onHome: () => void }) {
  const passed = score >= PASSING_SCORE;
  const wrongAnswers = questions.map((question, index) => ({ question, index, selected: answers[index] ?? null })).filter(({ question, selected }) => selected !== question.correctIndex);
  return <section className="mx-auto max-w-4xl px-4 py-10"><div className="lto-view w-full rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-10"><div className="text-center"><img src="/images/lto_logo.webp" alt="LTO logo" className="mx-auto h-20 w-20 object-contain" /><p className="mt-4 text-sm font-semibold tracking-wide text-[#0649ad]">Reviewer complete</p><h2 className="mt-2 text-5xl font-semibold">{score} / {total}</h2><p className={`mt-3 text-2xl font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>{passed ? 'Passed' : 'Needs more practice'}</p><p className="mt-2 text-lg text-slate-600">Passing score: {PASSING_SCORE} / {total} · You answered {Math.round((score / total) * 100)}% correctly.</p></div>
    {wrongAnswers.length > 0 && <div className="mt-10"><h3 className="text-2xl font-semibold">Incorrect answers ({wrongAnswers.length})</h3><div className="mt-4 space-y-5">{wrongAnswers.map(({ question, index, selected }) => <article key={index} className="overflow-hidden rounded-xl border border-red-200 bg-red-50/40"><div className="border-b border-red-200 bg-red-100 px-5 py-3 font-semibold text-red-800">Question {index + 1}</div><div className="p-5"><h4 className="text-xl font-semibold leading-snug">{question.question}</h4>{question.image && <img src={question.image} alt="Traffic sign for this question" className="mt-4 max-h-48 max-w-full rounded-lg bg-white object-contain p-2 shadow-sm" />}<div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-red-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Your answer</p><p className="mt-1 font-medium text-red-800">{selected === null ? 'No answer' : `${letters[selected]}. ${question.options[selected]}`}</p></div><div className="rounded-lg border border-green-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Correct answer</p><p className="mt-1 font-medium text-green-800">{letters[question.correctIndex]}. {question.options[question.correctIndex]}</p></div></div></div></article>)}</div></div>}
    {wrongAnswers.length === 0 && <p className="mt-8 rounded-xl bg-green-50 p-5 text-center font-semibold text-green-700">Perfect score — no incorrect answers to review.</p>}
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onRetry} className="lto-primary rounded-lg px-6 py-3 font-semibold text-white">Try another set</button><button onClick={onHome} className="rounded-lg border-2 border-[#084daf] px-6 py-3 font-semibold text-[#084daf] transition hover:bg-blue-50">Back to home</button></div></div></section>;
}
function ComingSoon({ title, subtitle, detail }: { title: string; subtitle: string; detail: string }) { return <div className="rounded-2xl border border-blue-300/50 bg-blue-950/40 p-6 opacity-80"><span className="inline-flex rounded-full border border-blue-200/60 px-3 py-1 text-xs font-semibold text-blue-100">Coming soon</span><h3 className="mt-4 text-2xl font-semibold">{title}</h3><p className="mt-1 text-lg font-medium text-blue-100">{subtitle}</p><p className="mt-3 text-sm text-blue-200">{detail}</p></div>; }
function ClockIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
