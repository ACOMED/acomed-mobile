import React, { createContext, useContext, useState } from 'react';

// This file creates a "global state" for dark/light mode.
// Any screen can read isDark and call toggleTheme from anywhere in the app.

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// useTheme is a hook — call it in any screen to get isDark and toggleTheme
export function useTheme() {
  return useContext(ThemeContext);
}

// ThemeProvider wraps the whole app so all screens share the same state
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Dark and light color palettes
export const LightColors = {
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  text2: '#6B7280',
  text3: '#9CA3AF',
  cardBg: '#FFFFFF',
  borderColor: '#E5E7EB',
};

export const DarkColors = {
  background: '#0F172A',
  white: '#1E293B',
  text: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#64748B',
  cardBg: '#1E293B',
  borderColor: '#334155',
};