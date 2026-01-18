'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [cookies, setCookies] = useState<string[] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('rcm_session');
    if (stored) {
      try {
        setCookies(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('rcm_session');
      }
    }
  }, []);

  const handleLoginSuccess = (sessionCookies: string[]) => {
    setCookies(sessionCookies);
    localStorage.setItem('rcm_session', JSON.stringify(sessionCookies));
  };

  const handleLogout = () => {
    setCookies(null);
    localStorage.removeItem('rcm_session');
  };

  if (!mounted) return null; // Avoid hydration mismatch

  if (!cookies) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard cookies={cookies} onLogout={handleLogout} />;
}
