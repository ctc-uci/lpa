import { create } from "zustand";

export const useDeletedIdsStore = create((set) => ({
  deletedIds: [],
  addDeletedId: (deletedId: string) => set((state : { deletedIds: string[] }) => ({ deletedIds: [...state.deletedIds, deletedId] })),
  setDeletedIds: (deletedIds: string[]) => set({ deletedIds }),
}));