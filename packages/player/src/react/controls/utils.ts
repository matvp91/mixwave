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

export function insertGenericStyle() {
  const style = document.createElement("style");
  style.setAttribute("data-sprs-style", "");
  style.innerText = `
  [data-sprs-container] video::-webkit-media-text-track-container {
    transform: scale(0.95);
  }
`;
  document.head.appendChild(style);
}
