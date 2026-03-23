import type { Language } from "./types";
import type { AppText, TranslationMap } from "./locales/schema";
import en from "./locales/en";
import pt from "./locales/pt";
import it from "./locales/it";
import ru from "./locales/ru";
import tr from "./locales/tr";

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Русский" },
  { value: "tr", label: "Türkçe" },
];

const translations: TranslationMap = {
  en,
  pt,
  it,
  ru,
  tr,
};

export type { AppText };

export function getTranslation(language: Language): AppText {
  return translations[language];
}