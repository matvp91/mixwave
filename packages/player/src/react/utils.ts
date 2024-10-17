export function toHMS(seconds: number) {
  const pad = (value: number) =>
    (10 ** 2 + Math.floor(value)).toString().substring(1);

  seconds = Math.floor(seconds);
  if (seconds < 0) {
    seconds = 0;
  }

  let result = "";

  const h = Math.trunc(seconds / 3600) % 24;
  if (h) {
    result += `${pad(h)}:`;
  }

  const m = Math.trunc(seconds / 60) % 60;
  result += `${pad(m)}:`;

  const s = Math.trunc(seconds % 60);
  result += `${pad(s)}`;

  return result;
}
