// TODO: may need an update based on Vulcan packages/vulcan-lib/lib/modules/intl.js
import { camelToSpaces } from "@vulcanjs/utils";
import SimpleSchema from "simpl-schema";
import {
  ValidationError,
  VulcanFieldSchema,
  VulcanSchema,
} from "@vulcanjs/schema";

// Locales
export const defaultLocale = "en"; //getSetting('locale', 'en');

export interface LocaleType {
  id: string;
  label?: string;
  required?: boolean;
  /** Locale must be fetched from the server (see LocaleContext) */
  dynamic?: boolean;
  /** Right-to-left (arabic, persian...) */
  rtl?: boolean;
  strings?: any;
  method?: any;
  /** If the id doesn't exist, we can try to fetch another local.
   * OriginalId is the initial requested id
   */
  originalId?: string;
}
export const Locales: Array<LocaleType> = [];

/**
 *  @deprecated Instead we should expose a Locale graphql model
 * @param locale
 */
export const registerLocale = (locale) => {
  Locales.push(locale);
};

/**
 * @deprecated
 */
export const getLocale = (localeId: string) => {
  return Locales.find((locale) => locale.id === localeId);
};

//
/*

Helper to detect current browser locale

*/
export const detectLocale = () => {
  let lang;

  if (typeof navigator === "undefined") {
    return null;
  }

  if (navigator.languages && navigator.languages.length) {
    // latest versions of Chrome and Firefox set this correctly
    lang = navigator.languages[0];
  } else if ((navigator as any).userLanguage) {
    // IE only
    lang = (navigator as any).userLanguage;
  } else {
    // latest versions of Chrome, Firefox, and Safari set this correctly
    lang = navigator.language;
  }

  return lang;
};

/*

Find best matching locale

en-US -> en-US
en-us -> en-US
en-gb -> en-US
etc.

*/
export const truncateKey = (key) => key.split("-")[0];

export const getValidLocale = (localeId: string) => {
  const validLocale = Locales.find((locale: LocaleType) => {
    const { id } = locale;
    return (
      id.toLowerCase() === localeId.toLowerCase() ||
      truncateKey(id) === truncateKey(localeId)
    );
  });
  return validLocale;
};

/*

Figure out the correct locale to use based on the current user, cookies,
and browser settings

*/
export const initLocale = ({
  currentUser = {},
  cookies = {},
  locale,
}: {
  currentUser?: any;
  cookies?: { locale?: string };
  locale?: any;
}): LocaleType => {
  let userLocaleId = "";
  let localeMethod = "";
  const detectedLocale = detectLocale();

  if (locale) {
    // 1. locale is passed from AppGenerator through SSR process
    userLocaleId = locale;
    localeMethod = "SSR";
  } else if (cookies.locale) {
    // 2. look for a cookie
    userLocaleId = cookies.locale;
    localeMethod = "cookie";
  } else if (currentUser && currentUser.locale) {
    // 3. if user is logged in, check for their preferred locale
    userLocaleId = currentUser.locale;
    localeMethod = "user";
  } else if (detectedLocale) {
    // 4. else, check for browser settings
    userLocaleId = detectedLocale;
    localeMethod = "browser";
  }

  /*

  NOTE: locale fallback doesn't work anymore because we can now load locales dynamically
  and Strings[userLocale] will then be empty

  */
  // if user locale is available, use it; else compare first two chars
  // of user locale with first two chars of available locales
  // const availableLocales = Object.keys(Strings);
  // const availableLocale = Strings[userLocale] ? userLocale : availableLocales.find(locale => locale.slice(0, 2) === userLocale.slice(0, 2));

  const validLocale = getValidLocale(userLocaleId);

  // 4. if user-defined locale is available, use it; else default to setting or `en-US`
  if (validLocale) {
    return {
      id: validLocale.id,
      originalId: userLocaleId,
      method: localeMethod,
    };
  } else {
    return {
      id: "en-US", //getSetting("locale", "en-US"),
      originalId: userLocaleId,
      method: "setting",
    };
  }
};

// Strings
export const Strings = {};
export const addStrings = (language, strings) => {
  if (typeof Strings[language] === "undefined") {
    Strings[language] = {};
  }
  Strings[language] = {
    ...Strings[language],
    ...strings,
  };
};

export const getString = ({ id, values, defaultMessage, locale }) => {
  let message = "";

  if (Strings[locale] && Strings[locale][id]) {
    message = Strings[locale][id];
  } else if (Strings[defaultLocale] && Strings[defaultLocale][id]) {
    // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using defaultLocale "${defaultLocale}".\x1b[0m`);
    message = Strings[defaultLocale] && Strings[defaultLocale][id];
  } else if (defaultMessage) {
    // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using default message "${defaultMessage}".\x1b[0m`);
    message = defaultMessage;
  }

  if (values && typeof values === "object") {
    Object.keys(values).forEach((key) => {
      // note: see replaceAll definition in vulcan:lib/utils
      message = (message as any).replaceAll(`{${key}}`, values[key]); // TODO: false positive on replaceAll not existing in TS
    });
  }
  return message;
};

export const getStrings = (localeId) => {
  return Strings[localeId];
};

// domains
export const Domains = {};
export const registerDomain = (locale, domain) => {
  Domains[domain] = locale;
};

// Helpers
/*

Look for type name in a few different places
Note: look into simplifying this

*/
export const isIntlField = (fieldSchema) => !!fieldSchema.intl;

/*

Look for type name in a few different places
Note: look into simplifying this

*/
export const isIntlDataField = (fieldSchema) => !!fieldSchema.isIntlData;

/*

Check if a schema already has a corresponding intl field

*/
export const schemaHasIntlField = (schema, fieldName) =>
  !!schema[`${fieldName}_intl`];

/*

Generate custom IntlString SimpleSchema type

*/
export const getIntlString = (): SimpleSchema & { name: string } => {
  const schema = {
    locale: {
      type: String,
      optional: true,
    },
    value: {
      type: String,
      optional: true,
    },
  };

  const IntlString = new SimpleSchema(schema);
  (IntlString as any).name = "IntlString";
  return IntlString as SimpleSchema & { name: string };
};

/*

Check if a schema has at least one intl field

*/
export const schemaHasIntlFields = (schema) =>
  Object.keys(schema).some((fieldName) => isIntlField(schema[fieldName]));

/*

Custom validation function to check for required locales

See https://github.com/aldeed/simple-schema-js#custom-field-validation

*/
export const validateIntlField = function () {
  let errors: Array<ValidationError> = [];

  // go through locales to check which one are required
  const requiredLocales = Locales.filter((locale) => locale.required);

  requiredLocales.forEach((locale, index) => {
    const strings = this.value;
    const hasString =
      strings &&
      Array.isArray(strings) &&
      strings.some((s) => s && s.locale === locale.id && s.value);
    if (!hasString) {
      const originalFieldName = this.key.replace("_intl", "");
      errors.push({
        id: "errors.required",
        path: `${this.key}.${index}`,
        properties: { name: originalFieldName, locale: locale.id },
      });
    }
  });

  if (errors.length > 0) {
    // hack to work around the fact that custom validation function can only return a single string
    return `intlError|${JSON.stringify(errors)}`;
  }
};

/*

Get an array of intl keys to try for a field

*/
export const getIntlKeys = ({
  fieldName,
  collectionName,
  schema,
}: {
  fieldName: string;
  collectionName: string;
  schema: VulcanSchema;
}) => {
  const fieldSchema =
    schema && schema[fieldName] ? schema[fieldName] : ({} as VulcanFieldSchema);

  const { intlId } = fieldSchema;

  const intlKeys: Array<string> = [];
  if (intlId) {
    intlKeys.push(intlId);
  }
  if (collectionName) {
    intlKeys.push(`${collectionName.toLowerCase()}.${fieldName}`);
  }
  intlKeys.push(`global.${fieldName}`);
  intlKeys.push(fieldName);

  return intlKeys;
};

/**
 * getIntlLabel - Get a label for a field, for a given collection, in the current language.
 * The evaluation is as follows :
 * i18n(intlId) >
 * i18n(collectionName.fieldName) >
 * i18n(global.fieldName) >
 * i18n(fieldName)
 *
 * @param  {object} params
 * @param  {object} params.intl               An intlShape object obtained from the react context for example
 * @param  {string} params.fieldName          The name of the field to evaluate (required)
 * @param  {string} params.collectionName     The name of the collection the field belongs to
 * @param  {object} params.schema             The schema of the collection
 * @param  {object} values                    The values to pass to format the i18n string
 * @return {string}                           The translated label
 */
export const getIntlLabel = (
  {
    intl,
    fieldName,
    collectionName,
    schema,
    isDescription,
  }: {
    intl?: any;
    fieldName: string;
    schema: VulcanSchema;
    collectionName?: string;
    isDescription?: boolean;
  },
  values?: any
) => {
  const fieldSchema = schema?.[fieldName]
    ? schema[fieldName]
    : ({} as VulcanFieldSchema);
  const { intlId } = fieldSchema;
  if (!fieldName) {
    throw new Error(
      "fieldName option passed to formatLabel cannot be empty or undefined"
    );
  }

  // if this is a description, just add .description at the end of the intl key
  const suffix = isDescription ? ".description" : "";

  const intlKeys: Array<string> = [];
  if (intlId) {
    intlKeys.push(intlId);
  }
  if (collectionName) {
    intlKeys.push(`${collectionName.toLowerCase()}.${fieldName}`);
  }
  intlKeys.push(`global.${fieldName}`);
  intlKeys.push(fieldName);

  let intlLabel;

  for (const intlKey of intlKeys) {
    const intlString = intl.formatMessage({ id: intlKey + suffix }, values);

    if (intlString !== "") {
      intlLabel = intlString;
      break;
    }
  }
  return intlLabel;
};

/*

Get intl label or fallback

*/
export const formatLabel = (
  options: {
    intl?: any;
    fieldName: string;
    schema: VulcanSchema;
    collectionName?: string;
  },
  values?: any
) => {
  const { fieldName, schema } = options;
  const fieldSchema = schema?.[fieldName]
    ? schema[fieldName]
    : ({} as VulcanFieldSchema);
  const { label: schemaLabel } = fieldSchema;
  return (
    getIntlLabel(options, values) || schemaLabel || camelToSpaces(fieldName)
  );
};
