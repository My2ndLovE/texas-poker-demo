import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameSettings } from '@/types';

interface SettingsStore extends GameSettings {
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: GameSettings = {
  numBots: 5,
  botDifficulty: 'mixed',
  startingChips: 1000,
  blindLevel: {
    small: 5,
    big: 10,
  },
  actionTimer: 30,
  animationSpeed: 'normal',
  soundEffects: false,
  cardBackDesign: 'blue',
  language: 'en',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings: Partial<GameSettings>) => {
        set((state) => ({
          ...state,
          ...newSettings,
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'poker-game-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
