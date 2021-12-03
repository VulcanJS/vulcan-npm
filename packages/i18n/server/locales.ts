/**
 * Previously was defined in "intl"
 *
 * However we try to avoid this registry pattern as much as possible in Vulcan Next
 */

export interface LocaleType {
  id: string;
}

export const Locales: Array<LocaleType> = [];

/**
 *  @deprecated Instead we should expose a Locale graphql model
 * @param locale
 */
export const registerLocale = (locale: LocaleType) => {
  Locales.push(locale);
};

/**
 * @deprecated
 */
export const getLocale = (localeId: string) => {
  return Locales.find((locale) => locale.id === localeId);
};

export const Strings: { [key: string]: any } = {};

export const Domains = {};

export const addStrings = (localeId, strings) => {
  if (typeof Strings[localeId] === "undefined") {
    Strings[localeId] = {};
  }
  Strings[localeId] = {
    ...Strings[localeId],
    ...strings,
  };
};

export const getStrings = (localeId) => {
  return Strings[localeId];
};
