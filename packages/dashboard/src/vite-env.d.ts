/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STITCHER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
