import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PreferredLanguage } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  isLoading: boolean;
  language: PreferredLanguage;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setLoading: (isLoading: boolean) => void;
  setLanguage: (lang: PreferredLanguage) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      activeModal: null,
      isLoading: false,
      language: 'en' as PreferredLanguage,

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (isOpen) => {
        set({ sidebarOpen: isOpen });
      },

      setSidebarCollapsed: (isCollapsed) => {
        set({ sidebarCollapsed: isCollapsed });
      },

      openModal: (modalId) => {
        set({ activeModal: modalId });
      },

      closeModal: () => {
        set({ activeModal: null });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setLanguage: (lang) => {
        set({ language: lang });
      },
    }),
    {
      name: 'resumeai_ui_persist',
      storage: createJSONStorage(() => localStorage),
      // Persist only UI state settings, not open dialogs or loading states.
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        language: state.language,
      }),
    }
  )
);

export default useUIStore;
