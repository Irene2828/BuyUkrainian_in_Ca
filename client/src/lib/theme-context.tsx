// Re-export from next-themes for our custom hook
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme();

    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return {
        theme: theme as 'light' | 'dark' | 'system',
        toggleTheme,
        isDark,
        setTheme,
    };
}
