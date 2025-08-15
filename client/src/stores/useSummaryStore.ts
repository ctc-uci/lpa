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

export interface Summary {
  adjustmentValues: AdjustmentValue[];
  bookingId?: number | null;
  comments: Comment[];
  datetime: string;
  invoiceId: number;
}

export interface SummaryStore {
  summary: Summary[];
  setSummary: (summary: Summary[]) => void;
  setAdjustmentValue: (adjustmentValues: AdjustmentValue[], sessionIndex: number) => void;
  summaryTotal: number;
  setSummaryTotal: (summaryTotal: number) => void;
}

export const useSummaryStore = create<SummaryStore>((set) => ({
  summary: [],
  setSummary: (summary) => set(() => ({ summary })),

  // Adjustment Values
  setAdjustmentValue: (adjustmentValues, sessionIndex) => set((state) => ({ summary: state.summary.map((s, idx) => idx === sessionIndex ? { ...s, adjustmentValues } : s) })),
  
  summaryTotal: 0,
  setSummaryTotal: (summaryTotal) => set(() => ({ summaryTotal }))
}));