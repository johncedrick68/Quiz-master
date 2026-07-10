import Head from 'next/head';
import { useEffect, useState } from 'react';
import { motorcycleAA1English } from '../data/lto/motorcycleAA1English';

type Screen = 'home' | 'selection' | 'quiz' | 'result';
const letters = ['A', 'B', 'C'];
const QUESTION_SECONDS = 60;

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const question = motorcycleAA1English[current];
  const score = answers.reduce<number>((total, answer, index) => total + (answer === motorcycleAA1English[index].correctIndex ? 1 : 0), 0);

  useEffect(() => {
    if (screen !== 'quiz' || timeLeft <= 0) return;
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen !== 'quiz' || timeLeft !== 0) return;
    setAnswers((previous) => [...previous, selected]);
    if (current === motorcycleAA1English.length - 1) {
      setScreen('result');
    } else {
      setCurrent((value) => value + 1);
      setSelected(null);
      setTimeLeft(QUESTION_SECONDS);
    }
  }, [screen, timeLeft, current, selected]);

  const start = () => { setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(QUESTION_SECONDS); setScreen('quiz'); };
  const advance = () => {
    if (selected === null) return;
    setAnswers((previous) => [...previous, selected]);
    if (current === motorcycleAA1English.length - 1) setScreen('result');
    else { setCurrent((value) => value + 1); setSelected(null); setTimeLeft(QUESTION_SECONDS); }
  };
  const background = screen === 'home' || screen === 'selection' ? '/images/lto_landing_background.webp' : '/images/lto_background.webp';

  return <><Head><title>LTO Driving License Reviewer</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></Head>
    <main className="min-h-screen bg-[#0649ad] text-white" style={{ backgroundImage: `linear-gradient(rgba(4, 49, 132, .62), rgba(4, 49, 132, .78)), url('${background}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <Header />
      {screen === 'home' && <Welcome onStart={() => setScreen('selection')} />}
      {screen === 'selection' && <Selection onStart={start} onBack={() => setScreen('home')} />}
      {screen === 'quiz' && <Quiz question={question} current={current} selected={selected} timeLeft={timeLeft} onSelect={setSelected} onNext={advance} onExit={() => setScreen('selection')} />}
      {screen === 'result' && <Result score={score} onRetake={start} onHome={() => setScreen('home')} />}
    </main>
  </>;
}

function Header() {
  return <><header className="border-b border-blue-300/30 bg-[#0348ac]/95 shadow-lg"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-7"><div className="flex min-w-0 items-center gap-2.5"><img src="/images/lto_logo.webp" alt="LTO logo" className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" /><div className="min-w-0"><p className="truncate text-base font-black uppercase tracking-tight sm:text-2xl">Driving License Reviewer</p><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-blue-200 sm:text-xs">LTO exam practice</p></div></div><span className="rounded-full border border-blue-200/50 bg-white/10 px-3 py-1.5 text-xs font-bold sm:text-sm">Non-professional</span></div></header></>;
}

function Welcome({ onStart }: { onStart: () => void }) {
  return <section className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center px-4 py-8 sm:py-12"><div className="w-full overflow-hidden rounded-2xl border border-white/25 bg-[#0b55b8]/85 shadow-2xl backdrop-blur-sm"><div className="flex min-h-[570px] flex-col items-center justify-center px-6 py-12 text-center sm:px-12"><p className="text-base font-medium text-blue-100 sm:text-2xl">Welcome to</p><img src="/images/lto_logo.webp" alt="Land Transportation Office" className="my-5 h-28 w-28 object-contain drop-shadow-lg sm:h-36 sm:w-36" /><h2 className="text-4xl font-black tracking-tight sm:text-7xl">LTO REVIEWER</h2><p className="mt-5 max-w-3xl text-base leading-relaxed text-blue-50 sm:text-2xl">Prepare with clear, timed practice questions for responsible and confident driving.</p><button onClick={onStart} className="mt-9 min-h-12 rounded-lg bg-[#ef0017] px-9 py-3 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#c90013] focus:outline-none focus:ring-4 focus:ring-red-300/50">CONTINUE</button><p className="mt-8 max-w-xl text-xs text-blue-100">Independent study tool. This is not the official LTMS portal or an official LTO examination.</p></div></div></section>;
}

function Selection({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-5xl items-center px-4 py-10"><div className="w-full rounded-2xl border border-white/30 bg-[#064cac]/90 p-6 shadow-2xl backdrop-blur sm:p-10"><button onClick={onBack} className="mb-6 text-sm font-bold text-blue-100 hover:text-white">← Back to home</button><div className="mb-8 text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-200">Choose a reviewer</p><h2 className="mt-2 text-3xl font-black sm:text-5xl">Start your practice</h2></div><div className="grid gap-4 md:grid-cols-2"><button onClick={onStart} className="group rounded-xl border-2 border-white bg-white p-6 text-left text-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-[#8edb9a]"><span className="inline-flex rounded-full bg-[#064cac] px-3 py-1 text-xs font-bold uppercase text-white">Available now</span><h3 className="mt-4 text-2xl font-black">Motorcycle</h3><p className="mt-1 text-lg font-bold text-[#064cac]">Non-Professional · Code A / A1</p><p className="mt-3 text-sm text-slate-600">English · 60 questions · Timed practice</p><span className="mt-5 inline-block rounded bg-[#0b51b4] px-5 py-2 font-bold text-white group-hover:bg-[#083d8a]">Start reviewer →</span></button><ComingSoon title="Motorcycle" subtitle="Non-Professional · Code A / A1" detail="Tagalog questionnaire" /><ComingSoon title="Light Vehicle" subtitle="Non-Professional · Code B, B1, B2" detail="English questionnaire" /><ComingSoon title="Light Vehicle" subtitle="Non-Professional · Code B, B1, B2" detail="Tagalog questionnaire" /></div></div></section>;
}

function Quiz({ question, current, selected, timeLeft, onSelect, onNext, onExit }: { question: typeof motorcycleAA1English[number]; current: number; selected: number | null; timeLeft: number; onSelect: (index: number) => void; onNext: () => void; onExit: () => void }) {
  const minutes = Math.floor(timeLeft / 60); const seconds = `${timeLeft % 60}`.padStart(2, '0');
  return <section className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8"><div className="overflow-hidden rounded-xl border border-blue-100 bg-white text-slate-900 shadow-2xl"><div className="flex items-center justify-between gap-3 bg-[#0649ad] px-4 py-3 text-white sm:px-7"><p className="font-bold">Questions: <span className="text-lg">{current + 1}</span> <span className="font-medium text-blue-100">out of</span> {motorcycleAA1English.length}</p><div className="flex items-center gap-3"><span className={`flex items-center gap-2 rounded-full px-3 py-1 font-bold ${timeLeft <= 10 ? 'animate-pulse bg-red-500' : 'bg-blue-800'}`}><ClockIcon />{minutes}:{seconds}</span><p className="hidden text-lg font-semibold sm:block">Code A, A1</p></div></div><div className="border-b border-slate-300 p-3 sm:p-5"><div className="min-h-28 border border-slate-300 p-4 sm:p-6"><span className="block text-sm text-slate-600">Question</span><h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{question.question}</h2></div></div><div className={`grid ${question.image ? 'lg:grid-cols-[330px_1fr]' : ''}`}>{question.image && <div className="flex items-center justify-center border-b border-slate-300 bg-slate-50 p-6 lg:border-b-0 lg:border-r"><img src={question.image} alt="Question reference" className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" /></div>}<div>{question.options.map((option, index) => <button key={option} onClick={() => onSelect(index)} className={`flex w-full items-center gap-5 border-b border-slate-300 px-5 py-5 text-left text-lg font-medium transition sm:px-10 sm:py-6 sm:text-2xl ${selected === index ? 'bg-[#c9e9a5] text-slate-900 ring-2 ring-inset ring-[#65a839]' : 'hover:bg-blue-50'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${selected === index ? 'bg-[#5aa431] text-white' : 'bg-slate-100 text-slate-700'}`}>{letters[index]}</span><span>{option}</span>{selected === index && <span className="ml-auto text-xl text-[#3f7d1c]">✓</span>}</button>)}</div></div><div className="flex items-center justify-between gap-4 p-4 sm:px-8"><button onClick={onExit} className="font-semibold text-slate-500 hover:text-[#0649ad]">Exit reviewer</button><button onClick={onNext} disabled={selected === null} className="min-h-11 rounded-lg bg-[#084daf] px-6 py-2.5 text-base font-bold text-white shadow transition hover:bg-[#063e91] disabled:cursor-not-allowed disabled:bg-slate-300">{current === motorcycleAA1English.length - 1 ? 'Finish' : 'Next'} →</button></div></div></section>;
}

function Result({ score, onRetake, onHome }: { score: number; onRetake: () => void; onHome: () => void }) { const total = motorcycleAA1English.length; return <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-3xl items-center px-4 py-10"><div className="w-full rounded-2xl bg-white p-8 text-center text-slate-900 shadow-2xl sm:p-12"><img src="/images/lto_logo.webp" alt="LTO logo" className="mx-auto h-20 w-20 object-contain" /><p className="mt-4 text-sm font-bold uppercase tracking-widest text-[#0649ad]">Reviewer complete</p><h2 className="mt-2 text-5xl font-black">{score} / {total}</h2><p className="mt-3 text-lg text-slate-600">You answered {Math.round((score / total) * 100)}% correctly.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onRetake} className="rounded-lg bg-[#084daf] px-6 py-3 font-bold text-white">Retake reviewer</button><button onClick={onHome} className="rounded-lg border-2 border-[#084daf] px-6 py-3 font-bold text-[#084daf]">Back to home</button></div></div></section>; }
function ComingSoon({ title, subtitle, detail }: { title: string; subtitle: string; detail: string }) { return <div className="rounded-xl border border-blue-300/50 bg-blue-950/40 p-6 opacity-80"><span className="inline-flex rounded-full border border-blue-200/60 px-3 py-1 text-xs font-bold uppercase text-blue-100">Coming soon</span><h3 className="mt-4 text-2xl font-black">{title}</h3><p className="mt-1 text-lg font-bold text-blue-100">{subtitle}</p><p className="mt-3 text-sm text-blue-200">{detail}</p></div>; }
function ClockIcon() { return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
