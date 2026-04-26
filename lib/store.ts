"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type AppState = {
  theme: Theme;
  shortcutsOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setShortcutsOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      shortcutsOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setShortcutsOpen: (open) => set({ shortcutsOpen: open })
    }),
    {
      name: "cipherdrill-ui"
    }
  )
);
