import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    accessibleMode: boolean;
    toggleAccessibleMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [accessibleMode, setAccessibleMode] = useState(() => {
        // Persist preference in localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('accessible-mode');
            return stored === 'true';
        }
        return false;
    });

    useEffect(() => {
        // Apply/remove class on body element
        if (accessibleMode) {
            document.body.classList.add('accessible-mode');
            localStorage.setItem('accessible-mode', 'true');
        } else {
            document.body.classList.remove('accessible-mode');
            localStorage.setItem('accessible-mode', 'false');
        }
    }, [accessibleMode]);

    const toggleAccessibleMode = () => {
        setAccessibleMode(prev => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ accessibleMode, toggleAccessibleMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
