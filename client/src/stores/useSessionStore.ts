import { create } from 'zustand'
import { useDeletedIdsStore } from './useDeletedIdsStore';

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
    order_index?: number;
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
    setAdjustmentValue: (sessionIndex: number, adjustmentValues: AdjustmentValue[]) => void;
    
    // Comments
    addComment: (sessionIndex: number, comment: string) => void;
    deleteComment: (sessionIndex: number, commentId: string) => void;
    setComment: (sessionIndex: number, commentIndex: number, comment: string) => void;

    // Custom Rows/Totals
    addCustomRow: (sessionIndex: number, customRow: Total) => void;
    setCustomRow: (sessionIndex: number, totalIndex: number, customRow: Total) => void;
    deleteCustomRow: (sessionIndex: number, totalIndex: number) => void;
}


export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    setSessions: (sessions) => set(() => ({ sessions })),
    addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
    deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.invoiceId !== id) })),

    // Adjustment Values
    addAdjustmentValue: (sessionId, adjustmentType, adjustmentValue) => set((state) => ({ sessions: state.sessions.map(s => s.invoiceId === sessionId ? { ...s, adjustmentValues: [...s.adjustmentValues, {type: adjustmentType, value: adjustmentValue }] } : s) })),
    setAdjustmentValue: (sessionIndex, adjustmentValues) => set((state) => ({ sessions: state.sessions.map((s, idx) => idx === sessionIndex ? { ...s, adjustmentValues } : s) })),
    
    //Comments
    addComment: (sessionIndex: number, comment: string) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, comments: [...(s.comments || []), { comment }] }
                : s
        ),
    })),
    deleteComment: (sessionIndex, commentIndex) => set((state) => {
        const session = state.sessions[sessionIndex];
        const commentToDelete = session?.comments?.[Number(commentIndex)];
        
        // Add the comment ID to deletedIdsStore if it exists
        if (commentToDelete?.id) {
            const deletedIdsStore = useDeletedIdsStore.getState() as { addDeletedId: (id: string) => void };
            deletedIdsStore.addDeletedId(commentToDelete.id);
        }
        
        return {
            sessions: state.sessions.map((s, idx) => {
                if (idx === sessionIndex) {
                    return { 
                        ...s, 
                        comments: (s.comments || []).filter((c, cidx) => cidx !== Number(commentIndex))
                    }
                }
                return s;
            })
        };
    }),
    setComment: (sessionIndex, commentIndex, comment) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, comments: (s.comments || []).map((c, cidx) => cidx === commentIndex ? { ...c, comment } : c) }
                : s
        ),
    })),

    // Totals
    addCustomRow: (sessionIndex, customRow) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, total: [...(s.total || []), customRow] }
                : s
        ),
    })),

    setCustomRow: (sessionIndex, totalIndex, customRow) => set((state) => ({
        sessions: state.sessions.map((s, idx) =>
            idx === sessionIndex
                ? { ...s, total: (s.total || []).map((t, tidx) => tidx === totalIndex ? customRow : t) }
                : s
        ),
    })),

    deleteCustomRow: (sessionIndex, totalIndex) => set((state) => ({
        sessions: state.sessions.map((s, idx) => {
            const totalToDelete = s.total?.[totalIndex];
            if (totalToDelete?.id) {
                const deletedIdsStore = useDeletedIdsStore.getState() as { addDeletedId: (id: string) => void };
                deletedIdsStore.addDeletedId(totalToDelete.id);
            }
            if (idx === sessionIndex) {
                return { ...s, total: (s.total || []).filter((t, tidx) => tidx !== totalIndex) }
            }
            return s;
        }
        ),
    })),
}))

