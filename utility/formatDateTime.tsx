import { TFunction } from "react-i18next";
import { Trans } from "react-i18next";
import { ReactElement } from "react-markdown/lib/react-markdown";

export function formatTimeRange(
  from: Date | undefined | null,
  to: Date | undefined | null,
  locale: string | undefined | null,
  timeZone: string | undefined | null,
  now: Date,
  t: TFunction,
  pastElement: ReactElement,
  includeFullDate?: boolean
) {
  const key =
    !from && to
      ? "onlyTo"
      : from && !to
      ? "onlyFrom"
      : from?.toDateString() === to?.toDateString()
      ? "sameDayFromTo"
      : "diffDayFromTo";

  function getDateString(d: Date | null | undefined) {
    function handleFull(rel: string) {
      return (
        rel +
        (includeFullDate
          ? " (" +
            d!.toLocaleDateString(locale ?? undefined, {
              timeZone: timeZone ?? undefined,
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) +
            ")"
          : "")
      );
    }

    return !d
      ? undefined
      : d.toDateString() === now.toDateString()
      ? handleFull(t("today"))
      : d.toDateString() === addDays(now, 1).toDateString()
      ? handleFull(t("tomorrow"))
      : d.toDateString() === addDays(now, -1).toDateString()
      ? handleFull(t("yesterday"))
      : d.toLocaleDateString(locale ?? undefined, {
          timeZone: timeZone ?? undefined,
          year: d?.getFullYear() === now.getFullYear() ? undefined : "numeric",
          day: "numeric",
          month: "long",
        });
  }

  function getTimeString(d: Date | null | undefined) {
    return d?.toLocaleTimeString(locale ?? undefined, {
      timeStyle: "short",
      timeZone: timeZone ?? undefined,
    });
  }

  return (
    <Trans
      t={t}
      i18nKey={key}
      values={{
        df: getDateString(from),
        dt: getDateString(to),
        tf: getTimeString(from),
        tt: getTimeString(to),
      }}
      components={{
        from: from && from.getTime() < now.getTime() ? pastElement : <span />,
        to: to && to.getTime() < now.getTime() ? pastElement : <span />,
      }}
    />
  );
}

function addDays(d: Date, offset: number) {
  const res = new Date(d);

  res.setDate(d.getDate() + offset);

  return res;
}
