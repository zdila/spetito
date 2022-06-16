import { useEffect, useState } from "react";

export function useDarkMode(serverDarkMode?: boolean) {
  const [darkMode, setDarkMode] = useState(serverDarkMode);

  useEffect(() => {
    const darkMode = !!window?.matchMedia?.("(prefers-color-scheme: dark)")
      .matches;

    document.cookie = `DARK_MODE=${darkMode}; path=/`;

    function handleMediaQueryListEvent(event: MediaQueryListEvent) {
      document.cookie = `DARK_MODE=${event.matches}; path=/`;

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
