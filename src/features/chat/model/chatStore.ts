import { create } from 'zustand';

interface ChatState {
  activeThreadId: string | null;
  isChatSidebarOpen: boolean;
  setActiveThreadId: (threadId: string | null) => void;
  toggleChatSidebar: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  isChatSidebarOpen: true,
  setActiveThreadId: (activeThreadId) => set({ activeThreadId }),
  toggleChatSidebar: () => set((state) => ({ isChatSidebarOpen: !state.isChatSidebarOpen })),
}));
