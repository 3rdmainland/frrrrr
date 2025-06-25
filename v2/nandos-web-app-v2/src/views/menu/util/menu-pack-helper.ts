/**
 * menuPack_helpers.ts
 * Helpers to parse and access  MenuPack JSON payloads, including product configuration extraction
 */

// --- RAW PAYLOAD TYPES ---
export interface MenuPack {
  id: string;
  products: MenuProduct[];
  productDefinitions: ProductDefinition[];
  productFeatures: ProductFeature[];
  productAllergens: ProductAllergen[];
  nutritionalComponents: NutritionalComponent[];
  rootCategories: RootCategory[];
  categories: Category[];
  quickLinks: QuickLink[];
  searchKeywords: Record<string, SearchKeyword[]>;
}

export interface MenuProduct {
  id: string;
  productDefinitionId: string;
  productType: string;
  price: number;
  relatedProducts: string[];
}

// Extend product definitions to include configuration groups
export interface ProductDefinition {
  id: string;
  name: Record<string, string>;
  shortName?: Record<string, string>;
  description?: Record<string, string>;
  deliveryDisclaimer?: Record<string, string>;
  generalDisclaimer?: Record<string, string>;
  configurationGroups?: ConfigurationGroup[];
}

export interface ConfigurationGroup {
  id: string;
  name: Record<string, string>;
  minSelections: number;
  maxSelections: number;
  choices: ConfigurationChoice[];
}

export interface ConfigurationChoice {
  id: string;
  name: Record<string, string>;
  // nested sub-choices if present
  subChoices?: ConfigurationChoice[];
}

export interface ProductFeature { id: string; name: Record<string, string>; }
export interface ProductAllergen { id: string; name: Record<string, string>; description: Record<string, string>; }
export interface NutritionalComponent { id: string; name: Record<string, string>; description: Record<string, string>; unit: string; displayOrder: number; }
export interface RootCategory { destinationType: string; destinationId: string; displayOrder: number; }
export interface CategoryChild { destinationType: string; destinationId: string; displayOrder: number; }
export interface Category { id: string; displayType: string; name: Record<string, string>; children: CategoryChild[]; }
export interface QuickLink { destinationType: string; destinationId: string; displayOrder: number; }
export interface SearchKeyword { keyword: string; synonyms?: string[]; }

// --- PARSE RAW JSON ---
/**
 * Parse the raw JSON string into a typed MenuPack
 */
export function parseMenuPack(rawJson: string): MenuPack {
  return JSON.parse(rawJson) as MenuPack;
}

// --- DIRECT ACCESSORS ---
export const getProducts = (mp: MenuPack): MenuProduct[] => mp.products;
export const getProductDefinitions = (mp: MenuPack): ProductDefinition[] => mp.productDefinitions;
export const getProductFeatures = (mp: MenuPack): ProductFeature[] => mp.productFeatures;
export const getProductAllergens = (mp: MenuPack): ProductAllergen[] => mp.productAllergens;
export const getNutritionalComponents = (mp: MenuPack): NutritionalComponent[] =>
  [...mp.nutritionalComponents].sort((a,b) => a.displayOrder - b.displayOrder);
export const getRootCategories = (mp: MenuPack): RootCategory[] => mp.rootCategories;
export const getCategories = (mp: MenuPack): Category[] => mp.categories;
export const getQuickLinks = (mp: MenuPack): QuickLink[] => mp.quickLinks;
export const getSearchKeywords = (mp: MenuPack): SearchKeyword[] =>
  Object.values(mp.searchKeywords).flat();

// --- UTILITIES ---
/**
 * Pick first available locale string (e.g. 'en-ZA' or fallback)
 */
function pickLabel(map: Record<string,string>): string {
  const first = Object.values(map)[0];
  return first || '';
}

// --- CONFIGURATION EXTRACTION ---
/**
 * Fetch raw configuration groups for a given product ID
 */
export function getConfigurationGroups(
  mp: MenuPack,
  productId: string
): ConfigurationGroup[] {
  const prod = mp.products.find(p => p.id === productId);
  if (!prod) return [];
  const def = mp.productDefinitions.find(d => d.id === prod.productDefinitionId);
  return def?.configurationGroups || [];
}

/**
 * Flatten configuration groups into a display-friendly structure
 */
export interface DisplayConfigOption {
  label: string;
  subOptions?: DisplayConfigOption[];
}
export interface DisplayConfigGroup {
  title: string;
  options: DisplayConfigOption[];
}

export function buildDisplayConfig(
  mp: MenuPack,
  productId: string
): DisplayConfigGroup[] {
  const groups = getConfigurationGroups(mp, productId);
  return groups.map(g => ({
    title: pickLabel(g.name),
    options: g.choices.map(choice => ({
      label: pickLabel(choice.name),
      subOptions: choice.subChoices?.map(sc => ({ label: pickLabel(sc.name) }))
    }))
  }));
}

// --- EXAMPLE USAGE ---
// const mp = parseMenuPack(rawJson);
// const display = buildDisplayConfig(mp, '3d60f6d0-8aa6-49b6-ba2e-e694dd42f56f');
// display.forEach(g => {
//   console.log(g.title);
//   g.options.forEach(o => {
//     console.log(' -', o.label);
//     o.subOptions?.forEach(sc => console.log('   -', sc.label));
//   });
// });
