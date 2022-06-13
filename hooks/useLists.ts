import { List } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetchFailHandler } from "./useFetchFailHandler";

export function useLists(enabled = true) {
  const [lists, setLists] = useState<List[]>();

  const handleFetchFail = useFetchFailHandler();

  useEffect(() => {
    if (enabled) {
      setLists(undefined);

      const abortController = new AbortController();

      (async () => {
        const response = await handleFetchFail(
          fetch("/api/lists", { signal: abortController.signal })
        );

        if (response) {
          setLists(await response.json());
        }
      })();

      return () => {
        abortController.abort();
      };
    }
  }, [enabled, handleFetchFail]);

  return lists;
}
