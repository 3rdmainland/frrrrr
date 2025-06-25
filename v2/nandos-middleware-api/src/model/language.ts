import { type ILanguage } from "@nandos-types/model/language";

export default class Language {
  public name: string;
  public iso: string;
  public rightToLeft: boolean;

  constructor(
    data: ILanguage = {
      name: "",
      iso: "",
      rightToLeft: false,
    }
  ) {
    this.name = data.name;
    this.iso = data.iso;
    this.rightToLeft = data.rightToLeft;
  }

  get default() {
    return this.iso == import.meta.env.VITE_DEFAULT_LOCALE;
  }

  get baseIso() {
    // converts a fully formed lang-region iso, like "en-ZA" to just the language component "en"
    return this.iso.split("-")[0];
  }
}
