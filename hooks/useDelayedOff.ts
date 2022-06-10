import { useEffect, useState } from "react";

export function useDelayedOff(value: boolean, delay = 1000) {
  const [on, setOn] = useState(value);

  useEffect(() => {
    let tid: number;

    if (value) {
      setOn(true);
    } else {
      tid = window.setTimeout(() => {
        setOn(false);
      }, delay);
    }

    return () => {
      if (tid !== undefined) {
        window.clearInterval(tid);
      }
    };
  }, [delay, value]);

  return on;
}
