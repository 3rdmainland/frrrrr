/// <reference types="vite/client" />

// Type definitions for environment variables
interface ImportMetaEnv {
  readonly VITE_VERSION: string
  readonly VITE_CONTEXT: string
  readonly VITE_REGION: string
  readonly VITE_DEFAULT_LOCALE: string
  readonly VITE_FALLBACK_LOCALE: string
  readonly VITE_API: string
  readonly VITE_WEBSITE_URL: string
  readonly VITE_GOOGLE_TAG_MANAGER_ID: string
  readonly VITE_GOOGLE_RECAPTCHA_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// For backward compatibility with process.env
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
  }
}