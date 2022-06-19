import { useEffect, useState } from "react";

export function useDarkMode(serverDarkMode?: boolean) {
  const [darkMode, setDarkMode] = useState(serverDarkMode);

  useEffect(() => {
    const newDarkMode = !!window?.matchMedia?.("(prefers-color-scheme: dark)")
      .matches;

    document.cookie = `DARK_MODE=${newDarkMode}; path=/; SameSite=Lax`;

    if (newDarkMode !== darkMode) {
      setDarkMode(newDarkMode);
    }

    function handleMediaQueryListEvent(event: MediaQueryListEvent) {
      document.cookie = `DARK_MODE=${event.matches}; path=/; SameSite=Lax`;

      setDarkMode(event.matches);
    }

    const mm = window.matchMedia("(prefers-color-scheme: dark)");

    mm.addEventListener("change", handleMediaQueryListEvent);

    return () => {
      mm.removeEventListener("change", handleMediaQueryListEvent);
    };
  }, [darkMode]);

  return darkMode;
}
