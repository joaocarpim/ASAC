// src/store/progressStore.ts
import { create } from "zustand";

type ProgressState = {
  activeProgressId: string | null;
  startedAtMs: number | null;
  setActive: (id: string | null) => void;
  startTimer: () => void;
  stopTimer: () => number;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  activeProgressId: null,
  startedAtMs: null,
  setActive: (id) => set({ activeProgressId: id }),
  startTimer: () => set({ startedAtMs: Date.now() }),
  stopTimer: () => {
    const s = get().startedAtMs;
    const sec = s ? Math.round((Date.now() - s) / 1000) : 0;
    set({ startedAtMs: null });
    return sec;
  },
}));
