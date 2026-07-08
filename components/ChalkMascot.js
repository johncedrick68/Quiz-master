export default function ChalkMascot({ mood = 'idle', size = 84 }) {
  // mood: 'idle' | 'thinking' | 'correct' | 'wrong' | 'celebrate'
  const mouths = {
    idle: 'M 30 58 Q 42 62 54 58',
    thinking: 'M 32 60 Q 42 56 52 60',
    correct: 'M 28 54 Q 42 72 56 54',
    wrong: 'M 30 62 Q 42 50 54 62',
    celebrate: 'M 26 52 Q 42 76 58 52',
  };

  const eyeShape =
    mood === 'correct' || mood === 'celebrate' ? 'arc' : mood === 'wrong' ? 'flat' : 'dot';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 84 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'transform 0.25s ease', transform: mood === 'celebrate' ? 'rotate(-4deg)' : 'none' }}
      aria-hidden="true"
    >
      <circle cx="42" cy="42" r="34" stroke="var(--chalk-white)" strokeWidth="2.5" strokeDasharray="3 4" opacity="0.9" />

      {eyeShape === 'dot' && (
        <>
          <circle cx="30" cy="36" r="2.6" fill="var(--chalk-white)" />
          <circle cx="54" cy="36" r="2.6" fill="var(--chalk-white)" />
        </>
      )}
      {eyeShape === 'arc' && (
        <>
          <path d="M 25 38 Q 30 30 35 38" stroke="var(--chalk-white)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 49 38 Q 54 30 59 38" stroke="var(--chalk-white)" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {eyeShape === 'flat' && (
        <>
          <path d="M 25 35 L 35 35" stroke="var(--chalk-white)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 49 35 L 59 35" stroke="var(--chalk-white)" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      <path d={mouths[mood]} stroke="var(--chalk-white)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {mood === 'celebrate' && (
        <>
          <path d="M 10 14 L 14 20" stroke="var(--chalk-yellow)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 74 16 L 70 22" stroke="var(--chalk-yellow)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 42 4 L 42 11" stroke="var(--chalk-yellow)" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
