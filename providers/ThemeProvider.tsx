'use client';

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
    setIsReady(true);
  }, []);

  if (!isReady) return null; 

  return <>{children}</>;
}
