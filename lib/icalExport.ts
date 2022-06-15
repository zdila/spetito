import ical from "ical-generator";
import { OfferExt } from "../types";

export function exportCalendarEvent(summary: string, offer: OfferExt) {
  const cal = ical();

  cal.createEvent({
    start: offer.validFrom,
    end: offer.validTo,
    summary,
    description: { plain: offer.message },
    organizer: { name: offer.author.name ?? "???" }, // TODO email if allows
    url: "https://www.spetito.com/?highlight-offer=" + offer.id,
    location:
      offer.lat != null && offer.lng != null
        ? {
            title: "???", // TODO rev. geocoding
            radius: offer.radius ?? undefined,
            geo: {
              lat: offer.lat,
              lon: offer.lng,
            },
          }
        : undefined,
  });

  const a = document.createElement("a");
  const b = new Blob([cal.toString()], { type: "text/calendar;charset=utf8" });

  a.href = URL.createObjectURL(b);
  a.setAttribute("download", "offer.ics");
  a.click();
  URL.revokeObjectURL(a.href);
}
