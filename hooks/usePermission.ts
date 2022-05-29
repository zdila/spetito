import { useEffect, useState } from "react";

export function usePermission(name: PermissionName) {
  const [state, setState] = useState<
    PermissionState | undefined | "unsupported"
  >(
    typeof navigator !== "undefined" && navigator.permissions
      ? undefined
      : "unsupported"
  );

  useEffect(() => {
    navigator.permissions
      ?.query({ name, userVisibleOnly: true } as any)
      .then((permissionStatus) => {
        setState(permissionStatus.state);

        permissionStatus.addEventListener("change", () => {
          setState(permissionStatus.state);
        });
      });
  });

  return state;
}
