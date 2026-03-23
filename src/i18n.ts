import type { Language } from "./types";
import type { AppText, TranslationMap } from "./locales/schema";
import en from "./locales/en";
import pt from "./locales/pt";
import it from "./locales/it";
import ru from "./locales/ru";
import tr from "./locales/tr";
import de from "./locales/de";
import fr from "./locales/fr";
import uk from "./locales/uk";

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Русский" },
  { value: "tr", label: "Türkçe" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "uk", label: "Українська" },
];

const translations: TranslationMap = {
  en,
  pt,
  it,
  ru,
  tr,
  de,
  fr,
  uk,
};

export type { AppText };

export function getTranslation(language: Language): AppText {
  return translations[language];
}