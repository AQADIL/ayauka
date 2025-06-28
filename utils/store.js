import { create } from 'zustand';

export const useGameStore = create((set) => ({
  progress: typeof window !== 'undefined' && localStorage.getItem('ayokin_progress')
    ? JSON.parse(localStorage.getItem('ayokin_progress'))
    : {},
  setProgress: (progress) => {
    set({ progress });
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayokin_progress', JSON.stringify(progress));
    }
  },
  resetProgress: () => {
    set({ progress: {} });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayokin_progress');
    }
  },
}));
