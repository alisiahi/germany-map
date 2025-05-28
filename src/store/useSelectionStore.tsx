import { create } from "zustand";

type SelectedGemeinde = {
  ags: string;
  gen: string;
} | null;

type SelectionState = {
  selectedGemeinde: SelectedGemeinde;
  setSelectedGemeinde: (gemeinde: SelectedGemeinde) => void;
  clearSelectedGemeinde: () => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedGemeinde: null,
  setSelectedGemeinde: (gemeinde) => set({ selectedGemeinde: gemeinde }),
  clearSelectedGemeinde: () => set({ selectedGemeinde: null }),
}));
