import { create } from 'zustand'

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

export interface Total {
    id: string;
    date: string;
    comment: string;
    value: number;
    order_index: number;
}

export interface Session {
    adjustmentValues: AdjustmentValue[];
    bookingDate: string;
    bookingId?: number;
    comments: Comment[];
    datetime: string;
    endTime: string;
    invoiceId: number;
    name: string;
    rate: string;
    startTime: string;
    total?: Total[];
    userId: number;
    order_index: number;
}

export interface SessionStore {
    sessions: Session[];
    setSessions: (sessions: Session[]) => void;
    addSession: (session: Session) => void;
    deleteSession: (id: number) => void;

    // Adjustment Values
    addAdjustmentValue: (sessionId: number, adjustmentType: string, adjustmentValue: number) => void;

    // Comments
    addComment: (sessionIndex: number, comment: string) => void;
    deleteComment: (sessionIndex: number, commentId: string) => void;
    setComment: (sessionIndex: number, commentIndex: number, comment: string) => void;
}



export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    setSessions: (sessions) => set(() => ({ sessions })),
    addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
    deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.invoiceId !== id) })),

    // Adjustment Values
    addAdjustmentValue: (sessionId, adjustmentType, adjustmentValue) => set((state) => ({ sessions: state.sessions.map(s => s.invoiceId === sessionId ? { ...s, adjustmentValues: [...s.adjustmentValues, {type: adjustmentType, value: adjustmentValue }] } : s) })),
    
    addComment: (sessionIndex: number, comment: string) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, comments: [...(s.comments || []), { comment }] }
                : s
        ),
    })),
    deleteComment: (sessionIndex, commentId) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, comments: (s.comments || []).filter((c) => c.id !== commentId) }
                : s
        ),
    })),
    setComment: (sessionIndex, commentIndex, comment) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, comments: (s.comments || []).map((c, cidx) => cidx === commentIndex ? { ...c, comment } : c) }
                : s
        ),
    })),
}))
