import { useEffect, useState } from "react";

export function usePermission(name: PermissionName) {
  const [state, setState] = useState<PermissionState>();

  useEffect(() => {
    navigator.permissions
      .query({ name, userVisibleOnly: true } as any)
      .then((permissionStatus) => {
        setState(permissionStatus.state);

        permissionStatus.addEventListener("change", () => {
          setState(permissionStatus.state);
        });
      });
  });

  return state;
}
