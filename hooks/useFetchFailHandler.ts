import { useTranslation } from "next-i18next";
import { useSnackbar } from "notistack";
import { useCallback } from "react";

export function useFetchFailHandler() {
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation("common");

  return useCallback(
    (rp: Promise<Response>) =>
      rp
        .then((res) => {
          if (res.ok) {
            return res;
          }

          if (res.status === 429) {
            enqueueSnackbar(t("RequestLimitExceeded"), { variant: "error" });
          } else {
            throw new Error();
          }
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }

          console.error(err);

          enqueueSnackbar(t("RequestFailed"), { variant: "error" });
        }),
    [enqueueSnackbar, t]
  );
}
