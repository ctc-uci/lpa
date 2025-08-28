import { create } from "zustand";

export interface AdjustmentValue {
  id?: string;
  type: string;
  value: number;
  order_index?: number;
}

export interface Comment {
  id?: string;
  comment: string;
  order_index?: number;
}

interface Total {
  id?: string;
  value: string;
  comment: string;
  date: string;
}

export interface Summary {
  adjustmentValues: AdjustmentValue[];
  bookingId?: number | null;
  comments: Comment[];
  datetime: string;
  invoiceId: number;
  total: Total[];
}

export interface SummaryStore {
  summary: Summary[];
  setSummary: (summary: Summary[]) => void;
  setAdjustmentValue: (adjustmentValues: AdjustmentValue[], sessionIndex: number) => void;
  setTotal: (total: Total, sessionIndex: number) => void;
  addTotal: (total: Total, sessionIndex: number) => void;
  deleteTotal: (totalId: string) => void;
  summaryTotal: number;
  setSummaryTotal: (summaryTotal: number) => void;
}

export const useSummaryStore = create<SummaryStore>((set) => ({
  summary: [],
  setSummary: (summary) => set(() => ({ summary })),

  // Adjustment Values
  setAdjustmentValue: (adjustmentValues, sessionIndex) => set((state) => ({ summary: state.summary.map((s, idx) => idx === sessionIndex ? { ...s, adjustmentValues } : s) })),

  summaryTotal: 0,
  setSummaryTotal: (summaryTotal) => set(() => ({ summaryTotal })),

  // Total
  setTotal: (total: Total, totalIndex: number) =>
    set((state) => ({
      summary: state.summary.map((s, idx) =>
        idx === 0
          ? { ...s, total: s.total.map((t) => (t.id === total.id ? total : t)) }
          : s
      ),
    })),
  addTotal: (total: Total) =>
    set((state) => ({
      summary: state.summary.map((s, idx) =>
        idx === 0 ? { ...s, total: [...s.total, total] } : s
      ),
    })),
  deleteTotal: (totalId: string) =>
    set((state) => ({
      summary: state.summary.map((s, idx) =>
        idx === 0
          ? { ...s, total: s.total.filter((t) => t.id !== totalId) }
          : s
      ),
    })),
}));