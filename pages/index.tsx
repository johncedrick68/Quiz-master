import Head from "next/head";
import { useEffect, useState } from "react";
import { motorcycleAA1English } from "../data/lto/motorcycleAA1English";
import { motorcycleAA1EnglishPart2 } from "../data/lto/motorcycleAA1EnglishPart2";
import { motorcycleAA1Tagalog } from "../data/lto/motorcycleAA1Tagalog";
import { motorcycleAA1TagalogPart2 } from "../data/lto/motorcycleAA1TagalogPart2";
import { motorcycleAA1TagalogPart3 } from "../data/lto/motorcycleAA1TagalogPart3";
import { lightVehicleBB1B2Tagalog } from "../data/lto/lightVehicleBB1B2Tagalog";
import { lightVehicleBB1English } from "../data/lto/lightVehicleBB1English";
import { shuffleArray } from "../lib/quizLogic";
import { Question } from "../types/quiz";

type Screen = "home" | "study" | "selection" | "quiz" | "result";
type Reviewer = "english" | "tagalog";
type ExamBank = "full" | "signs";
type ExamLength = 40 | 60 | 80;
const letters = ["A", "B", "C"];
const QUESTION_SECONDS = 60;
const reviewerDetails: Record<
  Reviewer,
  { title: string; code: string; language: string }
> = {
  english: {
    title: "All Vehicle Reviewer",
    code: "Codes A / A1 / B / B1 / B2",
    language: "English",
  },
  tagalog: {
    title: "All Vehicle Reviewer",
    code: "Codes A / A1 / B / B1 / B2",
    language: "Tagalog",
  },
};
const reviewerBanks: Record<Reviewer, Question[]> = {
  english: [
    ...motorcycleAA1English,
    ...motorcycleAA1EnglishPart2,
    ...lightVehicleBB1English,
  ],
  tagalog: [
    ...motorcycleAA1Tagalog,
    ...motorcycleAA1TagalogPart2,
    ...motorcycleAA1TagalogPart3,
    ...lightVehicleBB1B2Tagalog,
  ],
};
const uniqueQuestions = (questions: Question[]) =>
  questions.filter(
    (question, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.question.trim().toLowerCase() ===
            question.question.trim().toLowerCase() &&
          (candidate.image ?? "") === (question.image ?? ""),
      ) === index,
  );
const isSignQuestion = (question: Question) =>
  Boolean(question.image) ||
  /(traffic sign|road sign|sign mean|traffic light|signal light|senyas|ilaw trapiko|ilaw pantrapiko|karatula|pavement marking|linya.*daan)/i.test(
    question.question,
  );

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [questions, setQuestions] = useState<Question[]>(motorcycleAA1English);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewer, setReviewer] = useState<Reviewer>("english");
  const [examBank, setExamBank] = useState<ExamBank>("full");
  const [examLength, setExamLength] = useState<ExamLength>(60);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const question = questions[current];
  const score = answers.reduce<number>(
    (total, answer, index) =>
      total + (answer === questions[index].correctIndex ? 1 : 0),
    0,
  );

  useEffect(() => {
    if (screen !== "quiz" || timeLeft <= 0) return;
    const timer = window.setTimeout(
      () => setTimeLeft((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen !== "quiz" || timeLeft !== 0) return;
    saveAndAdvance(selected);
    // saveAndAdvance is intentionally triggered only when the timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen]);

  const begin = (
    selectedReviewer: Reviewer = reviewer,
    selectedBank: ExamBank = examBank,
    selectedLength: ExamLength = examLength,
  ) => {
    const completeBank = uniqueQuestions(reviewerBanks[selectedReviewer]);
    const bank =
      selectedBank === "signs"
        ? completeBank.filter(isSignQuestion)
        : completeBank;
    setReviewer(selectedReviewer);
    setExamBank(selectedBank);
    setExamLength(selectedLength);
    setQuestions(shuffleArray(bank).slice(0, selectedLength));
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTimeLeft(QUESTION_SECONDS);
    setScreen("quiz");
  };
  const saveAndAdvance = (answer: number | null) => {
    setAnswers((previous) => [...previous, answer]);
    if (current === questions.length - 1) setScreen("result");
    else {
      setCurrent((value) => value + 1);
      setSelected(null);
      setTimeLeft(QUESTION_SECONDS);
    }
  };
  const next = () => {
    if (selected !== null) {
      saveAndAdvance(selected);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const background =
    screen === "quiz" || screen === "result"
      ? "/images/lto_background.webp"
      : "/images/lto_landing_background.webp";

  return (
    <>
      <Head>
        <title>LTO Driving License Reviewer</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <main
        className="min-h-screen bg-[#0649ad] text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(4,49,132,.62),rgba(4,49,132,.78)),url('${background}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Header screen={screen} reviewer={reviewer} onNavigate={setScreen} />
        {screen === "home" && (
          <Welcome
            onStudy={() => setScreen("study")}
            onExam={() => setScreen("selection")}
          />
        )}
        {screen === "study" && <StudyReview />}
        {screen === "selection" && (
          <Selection onStart={begin} onBack={() => setScreen("home")} />
        )}
        {screen === "quiz" && (
          <Quiz
            question={question}
            index={current}
            total={questions.length}
            selected={selected}
            timeLeft={timeLeft}
            reviewer={reviewer}
            onSelect={setSelected}
            onNext={next}
            onExit={() => setScreen("selection")}
          />
        )}
        {screen === "result" && (
          <Results
            score={score}
            total={questions.length}
            questions={questions}
            answers={answers}
            onRetry={() => begin(reviewer, examBank, examLength)}
            onHome={() => setScreen("home")}
          />
        )}
      </main>
    </>
  );
}

function Header({
  screen,
  reviewer,
  onNavigate,
}: {
  screen: Screen;
  reviewer: Reviewer;
  onNavigate: (screen: Screen) => void;
}) {
  const code =
    screen === "quiz" || screen === "result"
      ? reviewerDetails[reviewer].code
      : "Motorcycle and light vehicle";
  return (
    <header className="sticky top-0 z-50 max-w-full overflow-x-hidden border-b border-blue-300/25 bg-[#0348ac]/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-7 sm:py-3">
        <button
          onClick={() => onNavigate("home")}
          className="flex min-w-0 items-center gap-2 text-left sm:gap-3"
        >
          <img
            src="/images/lto_logo.webp"
            alt="LTO logo"
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
          />
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight sm:text-xl">
              LTO Reviewer
            </p>
            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-blue-200 sm:text-xs">
              {code}
            </p>
          </div>
        </button>
        <nav
          aria-label="Main navigation"
          className="grid min-w-0 basis-full grid-cols-3 gap-1 rounded-xl bg-blue-950/30 p-1 text-center text-sm font-semibold sm:flex sm:w-auto sm:basis-auto sm:items-center"
        >
          <button
            onClick={() => onNavigate("home")}
            className={`min-h-10 rounded-lg px-2 py-2 sm:px-3 ${screen === "home" ? "bg-white text-[#0649ad]" : "hover:bg-white/10"}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("study")}
            className={`min-h-10 rounded-lg px-2 py-2 sm:px-3 ${screen === "study" ? "bg-white text-[#0649ad]" : "hover:bg-white/10"}`}
          >
            Review
          </button>
          <button
            onClick={() => onNavigate("selection")}
            className={`min-h-10 rounded-lg px-2 py-2 sm:px-3 ${screen === "selection" || screen === "quiz" || screen === "result" ? "bg-white text-[#0649ad]" : "hover:bg-white/10"}`}
          >
            Exams
          </button>
        </nav>
      </div>
    </header>
  );
}

function Welcome({
  onStudy,
  onExam,
}: {
  onStudy: () => void;
  onExam: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-76px)] min-w-0 max-w-6xl items-center overflow-x-hidden px-3 py-6 sm:px-4 sm:py-10">
      <div className="lto-view min-w-0 max-w-full flex-1 overflow-hidden rounded-3xl border border-white/30 bg-[#0b55b8]/85 shadow-2xl backdrop-blur-sm">
        <div className="flex min-h-[520px] flex-col items-center justify-center px-4 py-9 text-center sm:min-h-[560px] sm:px-6 sm:py-12">
          <p className="text-sm font-medium tracking-wide text-blue-100 sm:text-lg">
            Welcome to
          </p>
          <img
            src="/images/lto_logo.webp"
            alt="Land Transportation Office"
            className="lto-float my-5 h-28 w-28 object-contain drop-shadow-lg sm:h-36 sm:w-36"
          />
          <h1 className="max-w-full break-words text-3xl font-semibold leading-tight tracking-tight sm:text-6xl">
            LTO Driving License Reviewer
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-50 sm:text-xl">
            Study road signs and driving rules first, then test yourself with a
            timed 60-question exam.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:flex-row">
            <button
              onClick={onStudy}
              className="min-h-12 rounded-xl bg-white px-8 py-3 text-base font-semibold text-[#0649ad] shadow-lg transition hover:-translate-y-0.5"
            >
              Review topics
            </button>
            <button
              onClick={onExam}
              className="lto-primary min-h-12 rounded-xl px-8 py-3 text-base font-semibold text-white"
            >
              Take an exam <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="mt-8 max-w-xl text-xs leading-relaxed text-blue-100">
            Independent study tool. This is not the official LTMS portal or an
            official LTO examination.
          </p>
        </div>
      </div>
    </section>
  );
}

function Selection({
  onStart,
  onBack,
}: {
  onStart: (reviewer: Reviewer, bank: ExamBank, length: ExamLength) => void;
  onBack: () => void;
}) {
  const [language, setLanguage] = useState<Reviewer>("english");
  const [bank, setBank] = useState<ExamBank>("full");
  const [length, setLength] = useState<ExamLength>(60);
  const availableQuestions = uniqueQuestions(reviewerBanks[language]).filter(
    (question) => bank === "full" || isSignQuestion(question),
  ).length;
  const effectiveLength: ExamLength =
    availableQuestions >= length ? length : 40;
  return (
    <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl items-center px-4 py-7 sm:py-10">
      <div className="lto-view w-full rounded-3xl border border-white/30 bg-[#064cac]/90 p-5 shadow-2xl backdrop-blur sm:p-10">
        <button
          onClick={onBack}
          className="mb-6 text-sm font-medium text-blue-100 transition hover:text-white"
        >
          ← Back to home
        </button>
        <div className="mb-8 text-center">
          <p className="text-sm font-medium tracking-wide text-blue-200">
            Configure your practice
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-5xl">
            Build your exam
          </h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-6">
          <fieldset>
            <legend className="mb-3 text-lg font-semibold">Language</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["english", "tagalog"] as Reviewer[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`min-h-14 rounded-xl border-2 px-4 py-3 font-semibold capitalize ${language === option ? "border-white bg-white text-[#0649ad]" : "border-blue-300/50 bg-blue-950/25 hover:bg-blue-900/40"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-lg font-semibold">
              Question bank
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setBank("full")}
                className={`rounded-xl border-2 p-4 text-left ${bank === "full" ? "border-white bg-white text-[#0649ad]" : "border-blue-300/50 bg-blue-950/25 hover:bg-blue-900/40"}`}
              >
                <span className="block font-semibold">Full exam</span>
                <span className="mt-1 block text-sm opacity-75">
                  Mixed questions: rules, safety, signs, signals, and markings
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBank("signs")}
                className={`rounded-xl border-2 p-4 text-left ${bank === "signs" ? "border-white bg-white text-[#0649ad]" : "border-blue-300/50 bg-blue-950/25 hover:bg-blue-900/40"}`}
              >
                <span className="block font-semibold">Road signs only</span>
                <span className="mt-1 block text-sm opacity-75">
                  Focused questions about signs, signals, and road markings only
                </span>
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-lg font-semibold">Exam length</legend>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {([40, 60, 80] as ExamLength[]).map((option) => {
                const disabled = option > availableQuestions;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={disabled}
                    onClick={() => setLength(option)}
                    className={`min-h-16 rounded-xl border-2 px-2 py-3 ${length === option && !disabled ? "border-white bg-white text-[#0649ad]" : "border-blue-300/50 bg-blue-950/25"} disabled:cursor-not-allowed disabled:opacity-35`}
                  >
                    <span className="block text-xl font-bold">{option}</span>
                    <span className="text-xs">questions</span>
                  </button>
                );
              })}
            </div>
            {bank === "signs" && availableQuestions < 80 && (
              <p className="mt-3 text-sm text-blue-100">
                This language currently has {availableQuestions} unique unique
                sign questions, so unavailable lengths are disabled.
              </p>
            )}
          </fieldset>
          <div className="rounded-2xl bg-blue-950/30 p-4 text-sm text-blue-100">
            <p>
              <span className="font-semibold text-white">Selected:</span>{" "}
              {language === "english" ? "English" : "Tagalog"} ·{" "}
              {bank === "full" ? "Full exam" : "Road signs only"} ·{" "}
              {effectiveLength} questions
            </p>
            <p className="mt-1">
              Passing score: {Math.ceil(effectiveLength * 0.8)} /{" "}
              {effectiveLength} (80%)
            </p>
          </div>
          <button
            onClick={() => onStart(language, bank, effectiveLength)}
            className="lto-primary min-h-14 w-full rounded-xl px-6 py-3 text-lg font-semibold text-white"
          >
            Start exam →
          </button>
        </div>
      </div>
    </section>
  );
}

function Quiz({
  question,
  index,
  total,
  selected,
  timeLeft,
  reviewer,
  onSelect,
  onNext,
  onExit,
}: {
  question: Question;
  index: number;
  total: number;
  selected: number | null;
  timeLeft: number;
  reviewer: Reviewer;
  onSelect: (index: number) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const seconds = `${timeLeft % 60}`.padStart(2, "0");
  return (
    <section className="mx-auto max-w-6xl px-2 py-3 sm:px-6 sm:py-8">
      <div className="overflow-hidden rounded-xl border border-blue-100 bg-white text-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0649ad] px-3 py-3 text-sm text-white sm:gap-3 sm:px-7 sm:text-base">
          <p className="whitespace-nowrap font-semibold">
            Question <span className="text-base sm:text-lg">{index + 1}</span>{" "}
            <span className="font-medium text-blue-100">out of</span> {total}
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold sm:gap-2 sm:px-3 ${timeLeft <= 10 ? "animate-pulse bg-red-500" : "bg-blue-800"}`}
            >
              <ClockIcon />
              0:{seconds}
            </span>
            <p className="hidden text-lg font-semibold sm:block">
              {reviewerDetails[reviewer].code}
            </p>
          </div>
        </div>
        <div key={index} className="lto-question">
          <div className="border-b border-slate-300 p-2.5 sm:p-5">
            <div className="min-h-24 border border-slate-300 p-3 sm:min-h-28 sm:p-6">
              <span className="block text-xs text-slate-600 sm:text-sm">
                Question
              </span>
              <h2 className="mt-1 break-words text-xl font-semibold leading-snug sm:text-3xl sm:leading-tight">
                {question.question}
              </h2>
            </div>
          </div>
          <div
            className={`grid ${question.image ? "lg:grid-cols-[330px_1fr]" : ""}`}
          >
            {question.image && (
              <div className="flex items-center justify-center border-b border-slate-300 bg-slate-50 p-3 sm:p-6 lg:border-b-0 lg:border-r">
                <img
                  src={question.image}
                  alt="Traffic sign for this question"
                  className="max-h-44 max-w-full rounded-lg object-contain shadow-sm sm:max-h-64"
                />
              </div>
            )}
            <div>
              {question.options.map((option, optionIndex) => (
                <button
                  key={option}
                  onClick={() => onSelect(optionIndex)}
                  className={`lto-answer flex min-h-16 w-full items-center gap-3 border-b border-slate-300 px-3 py-3.5 text-left text-base font-medium leading-snug sm:min-h-20 sm:gap-5 sm:px-10 sm:py-6 sm:text-2xl ${selected === optionIndex ? "bg-[#c9e9a5] ring-2 ring-inset ring-[#65a839]" : "hover:bg-blue-50"}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold sm:h-10 sm:w-10 sm:text-lg ${selected === optionIndex ? "bg-[#5aa431] text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {letters[optionIndex]}
                  </span>
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-3 sm:px-8 sm:py-4">
          <button
            onClick={onExit}
            className="min-h-11 rounded-lg px-1 text-sm font-medium text-slate-500 transition hover:text-[#0649ad] sm:text-base"
          >
            Exit reviewer
          </button>
          <button
            onClick={onNext}
            disabled={selected === null}
            className="min-h-11 rounded-lg bg-[#084daf] px-5 py-2.5 text-base font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#063e91] disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-6"
          >
            {index === total - 1 ? "Finish" : "Next"} →
          </button>
        </div>
      </div>
    </section>
  );
}

function Results({
  score,
  total,
  questions,
  answers,
  onRetry,
  onHome,
}: {
  score: number;
  total: number;
  questions: Question[];
  answers: (number | null)[];
  onRetry: () => void;
  onHome: () => void;
}) {
  const passingScore = Math.ceil(total * 0.8);
  const passed = score >= passingScore;
  const wrongAnswers = questions
    .map((question, index) => ({
      question,
      index,
      selected: answers[index] ?? null,
    }))
    .filter(({ question, selected }) => selected !== question.correctIndex);
  return (
    <section className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="lto-view w-full rounded-2xl bg-white p-4 text-slate-900 shadow-2xl sm:p-10">
        <div className="text-center">
          <img
            src="/images/lto_logo.webp"
            alt="LTO logo"
            className="mx-auto h-20 w-20 object-contain"
          />
          <p className="mt-4 text-sm font-semibold tracking-wide text-[#0649ad]">
            Reviewer complete
          </p>
          <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">
            {score} / {total}
          </h2>
          <p
            className={`mt-3 text-2xl font-semibold ${passed ? "text-green-600" : "text-red-600"}`}
          >
            {passed ? "Passed" : "Needs more practice"}
          </p>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Passing score: {passingScore} / {total} · You answered{" "}
            {Math.round((score / total) * 100)}% correctly.
          </p>
        </div>
        {wrongAnswers.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-semibold">
              Incorrect answers ({wrongAnswers.length})
            </h3>
            <div className="mt-4 space-y-5">
              {wrongAnswers.map(({ question, index, selected }) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-xl border border-red-200 bg-red-50/40"
                >
                  <div className="border-b border-red-200 bg-red-100 px-5 py-3 font-semibold text-red-800">
                    Question {index + 1}
                  </div>
                  <div className="p-4 sm:p-5">
                    <h4 className="text-lg font-semibold leading-snug sm:text-xl">
                      {question.question}
                    </h4>
                    {question.image && (
                      <img
                        src={question.image}
                        alt="Traffic sign for this question"
                        className="mt-4 max-h-48 max-w-full rounded-lg bg-white object-contain p-2 shadow-sm"
                      />
                    )}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-red-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                          Your answer
                        </p>
                        <p className="mt-1 font-medium text-red-800">
                          {selected === null
                            ? "No answer"
                            : `${letters[selected]}. ${question.options[selected]}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Correct answer
                        </p>
                        <p className="mt-1 font-medium text-green-800">
                          {letters[question.correctIndex]}.{" "}
                          {question.options[question.correctIndex]}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        {wrongAnswers.length === 0 && (
          <p className="mt-8 rounded-xl bg-green-50 p-5 text-center font-semibold text-green-700">
            Perfect score — no incorrect answers to review.
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="lto-primary rounded-lg px-6 py-3 font-semibold text-white"
          >
            Try another set
          </button>
          <button
            onClick={onHome}
            className="rounded-lg border-2 border-[#084daf] px-6 py-3 font-semibold text-[#084daf] transition hover:bg-blue-50"
          >
            Back to home
          </button>
        </div>
      </div>
    </section>
  );
}
function StudyReview() {
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer>("english");
  const [topic, setTopic] = useState<"signs" | "rules">("signs");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const bank = uniqueQuestions(reviewerBanks[selectedReviewer]);
  const topicItems =
    topic === "signs"
      ? bank.filter(isSignQuestion)
      : bank.filter((question) => !isSignQuestion(question));
  const normalizedQuery = query.trim().toLowerCase();
  const items = normalizedQuery
    ? topicItems.filter((question) =>
        `${question.question} ${question.options[question.correctIndex]}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : topicItems;
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const changeLanguage = (value: Reviewer) => {
    setSelectedReviewer(value);
    setPage(1);
  };
  const changeTopic = (value: "signs" | "rules") => {
    setTopic(value);
    setPage(1);
  };
  const changePage = (value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="lto-view rounded-3xl border border-white/25 bg-[#064cac]/90 p-4 shadow-2xl sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            Study mode
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-5xl">
            Review before the exam
          </h1>
          <p className="mt-3 text-blue-100">
            Browse correct answers at your own pace. There is no timer or score
            here.
          </p>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(reviewerDetails) as Reviewer[]).map((key) => (
              <button
                key={key}
                onClick={() => changeLanguage(key)}
                className={`min-h-14 rounded-xl border p-3 text-left text-sm ${selectedReviewer === key ? "border-white bg-white text-[#0649ad]" : "border-blue-300/40 bg-blue-950/25 hover:bg-blue-900/40"}`}
              >
                <span className="block font-semibold">
                  {reviewerDetails[key].title}
                </span>
                <span className="text-xs opacity-80">
                  {reviewerDetails[key].language}
                </span>
              </button>
            ))}
          </div>
          <div className="flex min-h-12 rounded-xl bg-blue-950/35 p-1">
            <button
              onClick={() => changeTopic("signs")}
              className={`flex-1 rounded-lg px-4 py-2 font-semibold ${topic === "signs" ? "bg-white text-[#0649ad]" : ""}`}
            >
              Road signs
            </button>
            <button
              onClick={() => changeTopic("rules")}
              className={`flex-1 rounded-lg px-4 py-2 font-semibold ${topic === "rules" ? "bg-white text-[#0649ad]" : ""}`}
            >
              Rules
            </button>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-blue-300/30 bg-blue-950/25 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                {items.length} matching review cards
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-200">
                Tagalog contains more cards because its supplied source bank is
                larger; this is a content-volume difference, not a different set
                of traffic laws.
              </p>
            </div>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search reviewer…"
              aria-label="Search reviewer"
              className="min-h-11 w-full rounded-xl border border-blue-200/50 bg-white px-4 text-slate-900 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2 sm:max-w-xs"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((question, index) => (
            <article
              key={`${question.question}-${index}`}
              className="rounded-2xl bg-white p-4 text-slate-900 shadow-lg sm:p-5"
            >
              {question.image && (
                <img
                  src={question.image}
                  alt="Road sign being reviewed"
                  loading="lazy"
                  className="mx-auto mb-4 h-36 w-full object-contain"
                />
              )}
              <h2 className="text-lg font-semibold leading-snug">
                {question.question}
              </h2>
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Correct answer
                </p>
                <p className="mt-1 font-medium text-green-900">
                  {question.options[question.correctIndex]}
                </p>
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 && (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center text-slate-600">
            No review cards match your search.
          </div>
        )}
        {totalPages > 1 && (
          <nav
            aria-label="Reviewer pages"
            className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-blue-950/30 p-3"
          >
            <button
              disabled={currentPage === 1}
              onClick={() => changePage(Math.max(1, currentPage - 1))}
              className="min-h-11 rounded-xl bg-white px-3 font-semibold text-[#0649ad] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              ← Previous
            </button>
            <p className="text-center text-sm font-semibold">
              Page {currentPage} of {totalPages}
            </p>
            <button
              disabled={currentPage === totalPages}
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
              className="min-h-11 rounded-xl bg-white px-3 font-semibold text-[#0649ad] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
