import { create } from 'zustand';

type ActiveModal = 'create-post' | 'notifications' | null;

interface UiState {
  activeModal: ActiveModal;
  isSidebarCollapsed: boolean;
  setActiveModal: (modal: ActiveModal) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  isSidebarCollapsed: false,
  setActiveModal: (activeModal) => set({ activeModal }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
