import { create } from "zustand";

export const useSummaryStore = create((set) => ({
  summary: [],
  setSummary: (summary: any) => set({ summary }),
}));