import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'dark';

interface ThemeProviderProps {
    children: React.ReactNode;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'dark',
    setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light');
        root.classList.add('dark');
    }, []);

    const value = {
        theme: 'dark' as Theme,
        setTheme: () => null,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
