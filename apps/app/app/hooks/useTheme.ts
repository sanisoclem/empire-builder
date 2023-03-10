import { useLocalStorageStrict } from './useLocalStorage';
import { useEffect } from 'react';
import { z } from 'zod';

const themeCodec = z.union([z.literal('dark'), z.literal('notset'), z.literal('light')]).nullable();

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorageStrict('theme', themeCodec, null, 'notset');

  useEffect(() => {
    if (theme === 'notset') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, [setTheme, theme]);

  return {
    theme,
    setTheme
  };
};
