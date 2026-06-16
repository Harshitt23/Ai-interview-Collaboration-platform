import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  hydrate: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        token,
        user: response.data.user,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem("token");
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
