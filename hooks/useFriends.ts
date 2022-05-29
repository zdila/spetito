import { User } from "@prisma/client";
import { useEffect, useState } from "react";

export function useFriends(enabled = true) {
  const [friends, setFriends] = useState<User[]>();

  useEffect(() => {
    if (enabled) {
      setFriends(undefined);

      const abortController = new AbortController();

      fetch("/api/users?filter=friends", { signal: abortController.signal })
        .then((response) => response.json())
        .then(setFriends);

      return () => {
        abortController.abort();
      };
    }
  }, [enabled]);

  return friends;
}
