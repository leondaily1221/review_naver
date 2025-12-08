import React, { createContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<Partial<ThemeContextType>>({});

// 컴포넌트가 로드될 때 초기 테마를 결정하는 함수입니다.
// 로컬 스토리지에 'light'가 명시적으로 설정되어 있지 않으면 'dark'를 기본값으로 사용합니다.
const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light') {
        return 'light';
    }
    return 'dark';
};


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.error("테마를 로컬 스토리지에 저장하는 데 실패했습니다.", e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};