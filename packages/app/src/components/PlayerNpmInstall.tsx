import LinkIcon from "lucide-react/icons/link";

export function PlayerNpmInstall() {
  return (
    <div className="flex py-2 pl-4 pr-4 border border-border rounded-md items-center">
      <svg
        className="h-[10px] fill-primary/80"
        viewBox="0 0 12.32 9.33"
        fill="currentColor"
      >
        <g>
          <line x1="7.6" y1="8.9" x2="7.6" y2="6.9" />
          <rect width="1.9" height="1.9" />
          <rect x="1.9" y="1.9" width="1.9" height="1.9" />
          <rect x="3.7" y="3.7" width="1.9" height="1.9" />
          <rect x="1.9" y="5.6" width="1.9" height="1.9" />
          <rect y="7.5" width="1.9" height="1.9" />
        </g>
      </svg>
      <span
        className="text-primary/80 text-[13px] ml-1"
        style={{
          fontFamily: "Consolas, monaco, monospace",
          lineHeight: "24px",
        }}
      >
        npm i @superstreamer/player
      </span>
      <a
        href="https://www.npmjs.com/package/@superstreamer/player"
        className="hover:underline ml-auto"
        target="_blank"
      >
        <LinkIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
