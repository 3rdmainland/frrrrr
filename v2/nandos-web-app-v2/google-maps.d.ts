// types/google-maps.d.ts

// Google Maps Extended Component Library types
declare namespace JSX {
  interface IntrinsicElements {
    'gmpx-api-loader': {
      key: string
      'solution-channel'?: string
    }
    'gmpx-place-picker': {
      placeholder?: string
      class?: string
      forMap?: string
    }
    'gmpx-place-overview': {
      place?: string
      googleLogoAlreadyDisplayed?: boolean
      size?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large'
    }
  }
}

// Extend Window interface for custom properties
declare global {
  interface Window {
    google: typeof google
    GoogleMapsExtended?: {
      APILoader: any
      PlaceOverview: any
      PlacePicker: any
    }
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<ArrayBuffer | string>
    }
  }
}

// Export to make this a module
export {}
