import type { WinnerData } from '@/types';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface UIStore {
  // Modals
  isSettingsOpen: boolean;
  isStatsOpen: boolean;
  showWinnerAnnouncement: boolean;
  winnerData: WinnerData | null;

  // Toasts
  toasts: Toast[];

  // Actions
  openSettings: () => void;
  closeSettings: () => void;
  openStats: () => void;
  closeStats: () => void;
  showWinner: (data: WinnerData) => void;
  hideWinner: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSettingsOpen: false,
  isStatsOpen: false,
  showWinnerAnnouncement: false,
  winnerData: null,
  toasts: [],

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openStats: () => set({ isStatsOpen: true }),
  closeStats: () => set({ isStatsOpen: false }),

  showWinner: (data: WinnerData) =>
    set({
      showWinnerAnnouncement: true,
      winnerData: data,
    }),

  hideWinner: () =>
    set({
      showWinnerAnnouncement: false,
      winnerData: null,
    }),

  addToast: (message: string, type: Toast['type']) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Math.random().toString(36).substr(2, 9),
          message,
          type,
        },
      ],
    })),

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
