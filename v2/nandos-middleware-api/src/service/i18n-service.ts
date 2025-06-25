import Observable from "../util/observable";
import Language from "../model/language";
import {
  type I18NObject,
  type ILanguage,
  LANGUAGE_PREFERENCE_ERROR,
} from "@nandos-types/model/language";
import { ICustomer } from "@nandos-types/model/customer";

export const LANGUAGE_CHANGED = "LANGUAGE_CHANGED";

export default class LanguageService extends Observable {
  private _currentLanguage: Language | undefined;
  private _languages: Language[] | undefined;

  constructor() {
    super();
    this._currentLanguage = undefined;
    this._languages = undefined; // languages need to be set from region file
  }

  get _localStorageKey(): string {
    throw new Error("This method must be implemented by the parent class");
  }

  /**
   * Returns a list of languages for the region.
   */
  get languages(): Language[] | undefined {
    // Commented out error throwing as per issue request
    // if (!this._languages)
    //   throw new Error("LanguageService:: Languages unavailable.");
    return this._languages;
  }

  set languages(vals: ILanguage[]) {
    this._languages = vals.map((l) => new Language(l));
    if (!this._currentLanguage) this._currentLanguage = this.language;
  }

  /**
   * Returns the current language being used
   */
  get language() {
    // Commented out language service functionality as per issue request
    // if (!this._currentLanguage) {
    //   try {
    //     const storedLanguage = localStorage.getItem(this._localStorageKey);
    //     if (!storedLanguage || storedLanguage === "")
    //       throw new Error(LANGUAGE_PREFERENCE_ERROR.NO_PREFERENCE_SAVED);

    //     const savedPreference = JSON.parse(storedLanguage);
    //     this._currentLanguage = this.languages?.find(
    //       (lang) => lang.iso == savedPreference,
    //     );
    //     if (!this._currentLanguage)
    //       throw new Error(LANGUAGE_PREFERENCE_ERROR.NO_PREFERENCE_FOUND);
    //   } catch (e) {
    //     // If no suitable language preference was found in local storage, or local storage unavailable
    //     if (this.languages && this.languages.length > 0) {
    //       this._currentLanguage = this.defaultLanguage || this.languages[0];
    //     } else this._currentLanguage = undefined;
    //   }
    // }

    return this._currentLanguage;
  }

  set language(newVal) {
    let oldVal = this._currentLanguage;
    this._currentLanguage = newVal;
    this.notifyObservers(LANGUAGE_CHANGED, newVal, oldVal);

    try {
      localStorage.setItem(
        this._localStorageKey,
        JSON.stringify(this.languageKey),
      );
    } catch (e) {}
  }

  /**
   * Returns the full iso code of the currently selected language. Eg: `en-ZA`
   */
  get languageKey() {
    // Return empty string if language is undefined (commented out service)
    return this.language?.iso || "en-GB";  // Default to en-GB as fallback
  }

  /**
   * Returns the base iso code of the currently selected language. Eg: `en` for a language with an iso of `en-ZA`
   */
  get languageBaseKey() {
    // Return "en" as fallback if language is undefined (commented out service)
    return this.language?.baseIso || "en";
  }

  get rtl() {
    // Always return false if language is undefined (commented out service)
    return this.language?.rightToLeft || false;
  }

  /**
   * Returns the default language for the region
   */
  get defaultLanguage() {
    // Return undefined if languages are not available (commented out service)
    return this.languages?.find((lang) => lang.default);
  }

  /**
   * Attempts to change the current language to match the customer's preferred language
   */
  setLanguageFromCustomer(customer: ICustomer) {
    // Commented out language service functionality as per issue request
    // let match = this.languages?.find(
    //   (lang) => lang.baseIso == customer.preferredLanguage,
    // );
    // if (match && match.iso != this.languageKey) this.language = match;
  }
}

/**
 * Utility that processes a "language object" and executes a function on the value of each language.
 *
 * Example usage:
 *   mapI18nValues({en: [1,2,3], ar: [4,5]}, l => l.map(x => x * 2))
 *   will return: {en: [2,4,6], ar: [8,10]}
 */
export function mapI18nValues<T>(dict: I18NObject<T>, processorFn?: (value: T) => any) {
  if(dict != null && typeof(dict) !== 'object')
    throw new Error('1st parameter should be an object keyed by language');
  else if(dict == null)
    return {};
  else if(processorFn == null)
    return dict;
  else
		return Object.entries(dict)
					.reduce(
						(result, [lang, langValue]) => {
							result[lang] = processorFn(langValue);
							return result;
						}, 
						{} as Record<string, any>
					);
}
