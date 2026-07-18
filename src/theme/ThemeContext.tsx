import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultPalette, getPaletteById, palettes, type Palette } from './palettes';

const STORAGE_KEY = 'vane-bunny/theme';

interface ThemeContextValue {
  palette: Palette;
  palettes: Palette[];
  setPaletteId: (id: Palette['id']) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<Palette>(defaultPalette);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedId) => {
        if (storedId) setPalette(getPaletteById(storedId));
      })
      .catch((error) => console.error('Failed to load theme preference', error));
  }, []);

  function setPaletteId(id: Palette['id']) {
    setPalette(getPaletteById(id));
    AsyncStorage.setItem(STORAGE_KEY, id).catch((error) =>
      console.error('Failed to save theme preference', error)
    );
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ palette, palettes, setPaletteId }),
    [palette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
