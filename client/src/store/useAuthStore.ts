import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'GUARD' | 'USER';
  tenantId: string;
  clearanceLevel: number;
  org: string;
  slug?: string;
  plan?: string;
  isImpersonating?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  impersonatingFrom: string | null; 
  setAuth: (token: string, user: User) => void;
  setHasHydrated: (state: boolean) => void;
  impersonate: (shadowToken: string) => void;
  stopImpersonate: () => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      impersonatingFrom: null,
      setAuth: (token, user) => set({ token, user, impersonatingFrom: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      impersonate: (shadowToken) => {
        const currentToken = get().token;
        if (!get().impersonatingFrom) {
          set({ 
            token: shadowToken, 
            impersonatingFrom: currentToken 
          });
        }
      },
      stopImpersonate: () => {
        const originalToken = get().impersonatingFrom;
        if (originalToken) {
          set({ 
            token: originalToken, 
            impersonatingFrom: null 
          });
        }
      },
      logout: () => set({ token: null, user: null, impersonatingFrom: null }),
    }),
    {
      name: 'smartaccess-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      }
    }
  )
);
