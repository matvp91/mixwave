import type { Rendition } from "../../extern/hls-parser/types.js";

export type AudioRendition = Rendition & { type: "AUDIO" };
