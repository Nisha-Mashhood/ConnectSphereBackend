export const toMinutes = (time: string): number => {
  if (!time || typeof time !== "string") {
    throw new Error("Invalid time format");
  }

  const [hourPart, modifier] = time.trim().split(" ");
  const [hours, minutes] = hourPart.split(":").map(Number);

  let finalHours = hours;

  if (modifier === "PM" && hours !== 12) {
    finalHours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    finalHours = 0;
  }

  return finalHours * 60 + minutes;
};

export const isTimeWithinRange = (
  selectedTime: string,
  range: string,
  defaultDurationMinutes = 60,
): boolean => {
  if (!range || typeof range !== "string") {
    return false;
  }

  let start: string;
  let end: string;

  if (range.includes("-")) {
    [start, end] = range.split("-").map((t) => t.trim());
  } else {
    start = range.trim();

    const startMinutes = toMinutes(start);
    const endMinutes = startMinutes + defaultDurationMinutes;

    return (
      toMinutes(selectedTime) >= startMinutes &&
      toMinutes(selectedTime) < endMinutes
    );
  }

  if (!start || !end) return false;

  const selectedMinutes = toMinutes(selectedTime);
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  return selectedMinutes >= startMinutes && selectedMinutes < endMinutes;
};
