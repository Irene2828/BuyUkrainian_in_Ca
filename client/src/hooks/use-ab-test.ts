import { useState, useEffect } from 'react';
import { toast } from "sonner";

let currentGlobalVersion: 'A' | 'B' = 'A';
const listeners = new Set<(v: 'A' | 'B') => void>();

function setVersion(v: 'A' | 'B') {
  currentGlobalVersion = v;
  listeners.forEach((l) => l(v));
}

export function useFlagsABTest() {
  const [currentVersion, setCurrentVersion] = useState<'A' | 'B'>(currentGlobalVersion);

  useEffect(() => {
    listeners.add(setCurrentVersion);
    return () => {
      listeners.delete(setCurrentVersion);
    };
  }, []);

  useEffect(() => {
    const defaultVersion = localStorage.getItem('ab-flags-version') as 'A' | 'B' | null;
    if (defaultVersion && defaultVersion !== currentGlobalVersion) {
        setVersion(defaultVersion);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if the user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        const nextVersion = currentGlobalVersion === 'A' ? 'B' : 'A';
        localStorage.setItem('ab-flags-version', nextVersion);
        setVersion(nextVersion);
        toast.success(`A/B Test toggled to Version ${nextVersion}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isVersionB: currentVersion === 'B', version: currentVersion };
}
