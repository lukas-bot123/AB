import type { ChapterEvent } from "@/types/models";

export type EventCheckInState = "closed" | "not_open" | "open";

export function getEventCheckInState(
  event: Pick<ChapterEvent, "checkinClosesAt" | "checkinOpensAt">,
): EventCheckInState {
  if (event.checkinOpensAt && !event.checkinClosesAt) {
    return "open";
  }

  if (event.checkinClosesAt) {
    return "closed";
  }

  return "not_open";
}

export function getEventCheckInLabel(event: ChapterEvent) {
  const state = getEventCheckInState(event);

  if (state === "open") {
    return "Check-in open";
  }

  if (state === "closed") {
    return "Check-in closed";
  }

  return "Check-in not open";
}
