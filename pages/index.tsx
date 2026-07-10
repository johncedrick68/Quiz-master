import Head from 'next/head';
import { useState } from 'react';
import { motorcycleAA1English } from '../data/lto/motorcycleAA1English';

type Screen = 'landing' | 'quiz' | 'result';
const choices = ['A', 'B', 'C'];

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const question = motorcycleAA1English[current];
  const score = answers.reduce<number>((total, answer, index) => total + (answer === motorcycleAA1English[index].correctIndex ? 1 : 0), 0);

  const start = () => { setCurrent(0); setAnswers([]); setSelected(null); setScreen('quiz'); };
  const next = () => {
    if (selected === null) return;
    const updated = [...answers, selected];
    setAnswers(updated);
    if (current === motorcycleAA1English.length - 1) setScreen('result');
    else { setCurrent(current + 1); setSelected(null); }
  };

  return <>
    <Head><title>LTO Driving License Reviewer</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></Head>
    <main className="min-h-screen bg-[#0d55ba] text-white" style={{ backgroundImage: "linear-gradient(rgba(5, 62, 153, .58), rgba(5, 62, 153, .72)), url('/images/lto_background.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header className="border-b-2 border-black bg-[#0348ac]/95 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3"><img src="/images/lto_logo.webp" alt="LTO logo" className="h-11 w-11 object-contain sm:h-14 sm:w-14" /><h1 className="text-lg font-black uppercase tracking-tight text-white [text-shadow:2px_2px_0_#111] sm:text-3xl">Driving License Reviewer</h1></div>
          <span className="hidden text-xl font-bold [text-shadow:2px_2px_0_#111] sm:block">Non-professional</span>
        </div>
      </header>
      <div className="border-b border-blue-300/40 bg-[#115dbe]/80 py-1 text-center text-xs font-bold tracking-wider text-blue-100">LTO EXAM REVIEWER · PRACTICE RESPONSIBLY</div>

      {screen === 'landing' && <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-5xl items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-white/30 bg-[#064cac]/90 p-6 shadow-2xl backdrop-blur sm:p-10">
          <div className="mb-8 text-center"><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-blue-200">Official-style practice</p><h2 className="text-3xl font-black sm:text-5xl">Choose your reviewer</h2><p className="mx-auto mt-3 max-w-2xl text-blue-100">Practice road rules, signs, safety, and motorcycle knowledge before taking your LTO examination.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <button onClick={start} className="group rounded-xl border-2 border-white bg-white p-6 text-left text-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-yellow-300 hover:shadow-xl">
              <span className="mb-4 inline-flex rounded-full bg-[#064cac] px-3 py-1 text-xs font-bold uppercase text-white">Available now</span><h3 className="text-2xl font-black">Motorcycle</h3><p className="mt-1 text-lg font-bold text-[#064cac]">Non-Professional · Code A / A1</p><p className="mt-3 text-sm text-slate-600">English · 60 questions · Multiple choice</p><span className="mt-5 inline-block rounded bg-[#0b51b4] px-5 py-2 font-bold text-white group-hover:bg-[#083d8a]">Start reviewer →</span>
            </button>
            <ComingSoon title="Motorcycle" subtitle="Non-Professional · Code A / A1" detail="Tagalog questionnaire" />
            <ComingSoon title="Light Vehicle" subtitle="Non-Professional · Code B, B1, B2" detail="English questionnaire" />
            <ComingSoon title="Light Vehicle" subtitle="Non-Professional · Code B, B1, B2" detail="Tagalog questionnaire" />
          </div>
          <p className="mt-7 text-center text-xs text-blue-100">This is a study reviewer, not an official LTO examination. Verify rules and penalties with current LTO materials.</p>
        </div>
      </section>}

      {screen === 'quiz' && <section className="mx-auto max-w-6xl px-3 py-7 sm:px-6">
        <div className="overflow-hidden rounded-md border border-blue-100 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between gap-3 bg-[#0649ad] px-4 py-3 text-white sm:px-7"><p className="font-bold">◯ Questions: {current + 1} out of {motorcycleAA1English.length}</p><p className="hidden text-2xl font-medium sm:block">Code A, A1&nbsp; | &nbsp;Part 1 of 1</p></div>
          <div className="border-b border-slate-300 p-3 sm:p-5"><div className="min-h-32 border border-slate-300 p-4 sm:p-6"><span className="block text-sm text-slate-700">Question</span><h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{question.question}</h2></div></div>
          <div>{question.options.map((option, index) => <button key={option} onClick={() => setSelected(index)} className={`flex w-full items-center gap-5 border-b border-slate-300 px-6 py-6 text-left text-xl font-medium transition sm:px-10 sm:text-2xl ${selected === index ? 'bg-blue-100 ring-2 ring-inset ring-[#0752b7]' : 'hover:bg-slate-100'}`}><span className="font-black">[{choices[index]}]</span><span>{option}</span></button>)}</div>
          <div className="flex items-center justify-between gap-4 p-5 sm:px-8"><button onClick={() => setScreen('landing')} className="font-semibold text-slate-500 hover:text-[#0649ad]">Exit reviewer</button><button onClick={next} disabled={selected === null} className="rounded bg-[#084daf] px-6 py-3 text-lg font-bold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300">{current === motorcycleAA1English.length - 1 ? 'Finish' : 'Next'} ›</button></div>
        </div>
      </section>}

      {screen === 'result' && <section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-3xl items-center px-4 py-10"><div className="w-full rounded-xl bg-white p-8 text-center text-slate-900 shadow-2xl sm:p-12"><img src="/images/lto_logo.webp" alt="LTO logo" className="mx-auto h-20 w-20 object-contain" /><p className="mt-4 text-sm font-bold uppercase tracking-widest text-[#0649ad]">Reviewer complete</p><h2 className="mt-2 text-4xl font-black">{score} / {motorcycleAA1English.length}</h2><p className="mt-3 text-lg text-slate-600">You answered {Math.round((score / motorcycleAA1English.length) * 100)}% correctly.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={start} className="rounded bg-[#084daf] px-6 py-3 font-bold text-white">Retake reviewer</button><button onClick={() => setScreen('landing')} className="rounded border-2 border-[#084daf] px-6 py-3 font-bold text-[#084daf]">Choose another reviewer</button></div></div></section>}
    </main>
  </>;
}

function ComingSoon({ title, subtitle, detail }: { title: string; subtitle: string; detail: string }) {
  return <div className="rounded-xl border border-blue-300/50 bg-blue-950/40 p-6 opacity-80"><span className="mb-4 inline-flex rounded-full border border-blue-200/60 px-3 py-1 text-xs font-bold uppercase text-blue-100">Coming soon</span><h3 className="text-2xl font-black">{title}</h3><p className="mt-1 text-lg font-bold text-blue-100">{subtitle}</p><p className="mt-3 text-sm text-blue-200">{detail}</p></div>;
}
