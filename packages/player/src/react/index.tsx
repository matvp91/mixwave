export * from "./Controls";
export * from "./types";
export * from "../facade";

// Add generic styles that cannot be altered by tailwind.

const style = document.createElement("style");
style.setAttribute("data-mix-style", "");
style.innerText = `
  [data-mix-container] video::-webkit-media-text-track-container {
    transform: scale(0.95);
  }
`;
document.head.appendChild(style);

export * from "./useFacade";
