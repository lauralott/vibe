const TIME_ZONE = "Europe/Bratislava";

const partsToObject = (parts) =>
  parts.reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

const getTimeZoneOffsetMinutes = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = partsToObject(formatter.formatToParts(date));
  const utcTime = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return (utcTime - date.getTime()) / 60000;
};

const zonedTimeToUtc = (year, month, day, hour, minute, second, timeZone) => {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcDate, timeZone);
  return utcDate.getTime() - offsetMinutes * 60000;
};

const getTargetTimestamp = () => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const targetThisYear = zonedTimeToUtc(
    currentYear,
    12,
    26,
    15,
    25,
    0,
    TIME_ZONE
  );

  if (now.getTime() < targetThisYear) {
    return targetThisYear;
  }

  return zonedTimeToUtc(currentYear + 1, 12, 26, 15, 25, 0, TIME_ZONE);
};

const formatTargetTime = (timestamp) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(new Date(timestamp));
};

const pad = (value) => String(value).padStart(2, "0");

const updateCountdown = () => {
  const now = Date.now();
  const target = getTargetTimestamp();
  const diff = Math.max(target - now, 0);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);

  const targetTimeEl = document.getElementById("target-time");
  targetTimeEl.textContent = `(${formatTargetTime(target)})`;
};

updateCountdown();
setInterval(updateCountdown, 1000);
