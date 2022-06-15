import { useEffect, useState } from "react";
import type { MapDialogType } from "../components/MapDialog";

export function useLazyMapDialog(mountMapDialog: boolean) {
  const [mapDialog, setMapDialog] = useState<{ value: MapDialogType }>();

  useEffect(() => {
    if (mountMapDialog) {
      import("../components/MapDialog").then(({ MapDialog }) => {
        setMapDialog({ value: MapDialog });
      });
    }
  }, [mountMapDialog]);

  return mapDialog?.value;
}
