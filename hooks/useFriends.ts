import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetchFailHandler } from "./useFetchFailHandler";

export function useFriends(enabled = true) {
  const [friends, setFriends] = useState<User[]>();

  const handleFetchFail = useFetchFailHandler();

  useEffect(() => {
    if (enabled) {
      setFriends(undefined);

      const abortController = new AbortController();

      (async () => {
        const response = await handleFetchFail(
          fetch("/api/users?filter=friends", { signal: abortController.signal })
        );

        if (response) {
          setFriends(await response.json());
        }
      })();

      return () => {
        abortController.abort();
      };
    }
  }, [enabled, handleFetchFail]);

  return friends;
}
