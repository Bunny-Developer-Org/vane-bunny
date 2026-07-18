import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, type TranslationKey } from './translations';

const STORAGE_KEY = 'vane-bunny/language';

export type LanguageCode = keyof typeof translations;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Each language is always labeled in its own name (not translated), matching
// how language pickers conventionally read regardless of the active language.
export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
];

function isLanguageCode(value: string): value is LanguageCode {
  return value in translations;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/{{(\w+)}}/g, (_match, key) => String(vars[key] ?? ''));
}

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && isLanguageCode(stored)) setLanguageState(stored);
      })
      .catch((error) => console.error('Failed to load language preference', error));
  }, []);

  function setLanguage(code: LanguageCode) {
    setLanguageState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch((error) =>
      console.error('Failed to save language preference', error),
    );
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => interpolate(translations[language][key], vars),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
