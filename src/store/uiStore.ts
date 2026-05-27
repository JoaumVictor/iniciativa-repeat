import { create } from "zustand";

type UiState = {
  isTutorialVisible: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isTutorialVisible: true,
  showTutorial: () => set({ isTutorialVisible: true }),
  hideTutorial: () => set({ isTutorialVisible: false }),
}));
