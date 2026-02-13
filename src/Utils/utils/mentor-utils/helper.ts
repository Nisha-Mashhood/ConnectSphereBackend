  const toMinutes = (time: string): number => {
    const [hourMin, modifier] = time.trim().split(" ");
    let [hours, minutes] = hourMin.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  export const isTimeWithinRange = (selected: string, range: string): boolean => {
    const [start, end] = range.split("-").map(t => t.trim());

    const selectedMin = toMinutes(selected);
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    return selectedMin >= startMin && selectedMin < endMin;
  };