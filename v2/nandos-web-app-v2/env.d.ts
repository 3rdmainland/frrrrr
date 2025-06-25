/// <reference types="vite/client" />

// Type definitions for Vue components
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Type definitions for environment variables
interface ImportMetaEnv {
  readonly VITE_REGION: string
  readonly VITE_DEFAULT_LOCALE: string
  readonly VITE_FALLBACK_LOCALE: string
  readonly VITE_API: string
  readonly VITE_WEBSITE_URL: string
  readonly VITE_GOOGLE_TAG_MANAGER_ID: string
  readonly VITE_GOOGLE_RECAPTCHA_KEY
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

// allow TS to import .yml/.yaml as modules
declare module '*.yml' {
  const content: Record<string, any>;
  export default content;
}
declare module '*.yaml' {
  const content: Record<string, any>;
  export default content;
}
