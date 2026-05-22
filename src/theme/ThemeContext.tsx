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
  background: '#f9fafb',
  white: '#FFFFFF',
  text: '#0d1b3e',        // navy instead of near-black
  text2: '#8a8f9e',       // softer gray
  text3: '#c0c4d0',       // very light gray
  cardBg: '#FFFFFF',
  borderColor: '#dde0e8', // softer border
};
export const DarkColors = {
  background: '#0a0f1e',
  white: '#141c2e',
  text: '#ffffff',
  text2: '#a0aec0',
  text3: '#4a5568',
  cardBg: '#141c2e',
  borderColor: '#1e2a42',
};