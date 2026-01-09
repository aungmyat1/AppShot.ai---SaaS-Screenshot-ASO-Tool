import { create } from "zustand";

type UiState = {
  lastJobId: string | null;
  setLastJobId: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  lastJobId: null,
  setLastJobId: (id) => set({ lastJobId: id }),
}));

