function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatEventDateRange(startsAt: string, endsAt: string | null) {
  if (!endsAt) {
    return formatDateTime(startsAt);
  }

  return `${formatDateTime(startsAt)} to ${formatDateTime(endsAt)}`;
}

export function getEventTimingLabel(startsAt: string) {
  return new Date(startsAt).getTime() >= Date.now() ? "Upcoming" : "Past";
}

export function parseEventDateTimeInput(value: string) {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const parsedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day) ||
    parsedDate.getHours() !== Number(hour) ||
    parsedDate.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return parsedDate.toISOString();
}
