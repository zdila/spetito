import { useEffect, useState } from "react";

export function useAutoclearState<T>(
  initialValue: T | undefined,
  timeout = 5000
): T | undefined {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const tid = window.setTimeout(() => {
      setValue(undefined);
    }, timeout);

    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}
