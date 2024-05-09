const MILLISECONDS = {
  YEAR: 1000 * 60 * 60 * 24 * 30 * 12,
  MONTH: 1000 * 60 * 60 * 24 * 30,
  WEEK: 1000 * 60 * 60 * 24 * 7,
  DAY: 1000 * 60 * 60 * 24,
  HOUR: 1000 * 60 * 60,
  MINUTE: 1000 * 60,
  SECOND: 1000,
};

/** This function should be used when you want to convert milliseconds to a human readable format like 1d5h. */
export function humanizeMilliseconds(milliseconds: number, full = true) {
  if (full) {
    const years = Math.floor(milliseconds / MILLISECONDS.YEAR);
    const months = Math.floor((milliseconds % MILLISECONDS.YEAR) / MILLISECONDS.MONTH);
    const weeks = Math.floor(((milliseconds % MILLISECONDS.YEAR) % MILLISECONDS.MONTH) / MILLISECONDS.WEEK);
    const days = Math.floor((((milliseconds % MILLISECONDS.YEAR) % MILLISECONDS.MONTH) % MILLISECONDS.WEEK) / MILLISECONDS.DAY);
    const hours = Math.floor(
      ((((milliseconds % MILLISECONDS.YEAR) % MILLISECONDS.MONTH) % MILLISECONDS.WEEK) % MILLISECONDS.DAY) / MILLISECONDS.HOUR
    );
    const minutes = Math.floor(
      (((((milliseconds % MILLISECONDS.YEAR) % MILLISECONDS.MONTH) % MILLISECONDS.WEEK) % MILLISECONDS.DAY) % MILLISECONDS.HOUR) / MILLISECONDS.MINUTE
    );
    const seconds = Math.floor(
      ((((((milliseconds % MILLISECONDS.YEAR) % MILLISECONDS.MONTH) % MILLISECONDS.WEEK) % MILLISECONDS.DAY) % MILLISECONDS.HOUR) %
        MILLISECONDS.MINUTE) /
        1000
    );

    const yearString = years ? `${years}y ` : "";
    const monthString = months ? `${months}mo ` : "";
    const weekString = weeks ? `${weeks}w ` : "";
    const dayString = days ? `${days}d ` : "";
    const hourString = hours ? `${hours}h ` : "";
    const minuteString = minutes ? `${minutes}m ` : "";
    const secondString = seconds ? `${seconds}s ` : "";

    return `${yearString}${monthString}${weekString}${dayString}${hourString}${minuteString}${secondString}`.trimEnd() || "1s";
  }

  const days = Math.floor(milliseconds / MILLISECONDS.DAY);
  const hours = Math.floor((milliseconds % MILLISECONDS.DAY) / MILLISECONDS.HOUR);
  const minutes = Math.floor(((milliseconds % MILLISECONDS.DAY) % MILLISECONDS.HOUR) / MILLISECONDS.MINUTE);

  const dayString = days ? `${days}d ` : "";
  const hourString = hours ? `${hours}h ` : "";
  const minuteString = minutes ? `${minutes}m ` : "";

  return `${dayString}${hourString}${minuteString}`.trimEnd() || "1m";
}
