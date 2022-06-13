export function formatDateTime(
  d: Date,
  locale: string | undefined | null,
  timeZone: string | undefined | null
) {
  return (
    d.toLocaleDateString(locale ?? undefined, {
      timeZone: timeZone ?? undefined,
    }) +
    " " +
    d.toLocaleTimeString(locale ?? undefined, {
      timeStyle: "short",
      timeZone: timeZone ?? undefined,
    })
  );
}
