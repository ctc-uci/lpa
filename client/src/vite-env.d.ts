/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CALENDAR_USE_BACKEND?: string;
  readonly VITE_DEV_BACKEND_HOSTNAME?: string;
  readonly VITE_PROD_BACKEND_HOSTNAME?: string;
  readonly VITE_NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
