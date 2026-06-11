import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { UserProfile, AuthTokens } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: UserProfile, tokens: AuthTokens) => void;
  updateUser: (user: UserProfile) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const getBrowserStorage = (): StateStorage => {
  if (typeof window === 'undefined') return noopStorage;
  try {
    return window.localStorage;
  } catch {
    return noopStorage;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, tokens) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }

        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        // Clear cookies and storage keys
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Trigger native redirect to home/login
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'resumeai_auth_persist',
      storage: createJSONStorage(getBrowserStorage),
      // Only serialize user and tokens. Prevent storing UI flags in persist layer.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
