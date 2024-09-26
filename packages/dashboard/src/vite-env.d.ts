/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_ENDPOINT: string;
  readonly PUBLIC_STITCHER_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
