// Live date and time in Jakarta (GMT+7), formatted like the Figma design:
// "Wednesday, October 14" and "03:38PM".
const TIME_ZONE = "Asia/Jakarta";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function initHeroClock() {
  const dateEl = document.querySelector("[data-hero-date]");
  const timeEl = document.querySelector("[data-hero-time]");
  if (!dateEl || !timeEl) return () => {};

  let timer;

  const update = () => {
    const now = new Date();
    dateEl.textContent = dateFormat.format(now);
    // "03:38PM" with the colon in its own span so it can blink; its animation
    // is offset to start on a whole second.
    const [hours, rest] = timeFormat.format(now).replace(/\s/g, "").split(":");
    timeEl.innerHTML = `${hours}<span class="hero__time-colon" style="animation-delay: -${now.getMilliseconds()}ms">:</span>${rest}`;
    // Schedule the next update at the start of the next minute.
    timer = setTimeout(update, 60000 - (now.getTime() % 60000));
  };

  update();

  return () => clearTimeout(timer);
}
