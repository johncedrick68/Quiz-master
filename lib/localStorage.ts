import { QuizSession } from '../types/quiz';

const HISTORY_KEY = 'quiz_master_history';

export function saveSessionToHistory(session: QuizSession) {
  if (typeof window === 'undefined') return;
  try {
    const existingStr = localStorage.getItem(HISTORY_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    
    // Check if session already exists, update it, or add new
    const index = existing.findIndex((s: QuizSession) => s.id === session.id);
    if (index >= 0) {
      existing[index] = session;
    } else {
      existing.push(session);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

export function getHistory(): QuizSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const existingStr = localStorage.getItem(HISTORY_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (err) {
    console.error('Failed to load from local storage', err);
    return [];
  }
}
