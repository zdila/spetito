import { List } from "@prisma/client";
import { useEffect, useState } from "react";

export function useLists(enabled = true) {
  const [lists, setLists] = useState<List[]>();

  useEffect(() => {
    if (enabled) {
      setLists(undefined);

      const abortController = new AbortController();

      fetch("/api/lists", { signal: abortController.signal })
        .then((response) => response.json())
        .then(setLists);

      return () => {
        abortController.abort();
      };
    }
  }, [enabled]);

  return lists;
}
