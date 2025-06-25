export type MenuEvent = 'menuChanged' | 'menuLoaded';

export interface MenuResponse {
  data: {
    menu: any;
  };
}

export interface Promotion {
  id: string;
  name: string;
  appSplashScreen?: boolean;
  displayOrder?: number;
  // Other promotion properties
}

export interface AutoComboMatch {
  // Auto combo match properties
}

export interface Upsell {
  // Upsell properties
}

export interface Basket {
  // Basket properties
}