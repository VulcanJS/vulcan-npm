/**
 * In the future we might want to standardize those exports
 * @see https://github.com/VulcanJS/vulcan-next/issues/9
 */
import { LocalesRegistry, StringsRegistry } from "../intl";

//addGraphQLSchema(localeType);

const locale =
  (registries: {
    LocalesRegistry: LocalesRegistry;
    StringsRegistry: StringsRegistry;
  }) =>
  async (root, { localeId }, context) => {
    const locale = registries.LocalesRegistry.getLocale(localeId);
    const strings = registries.StringsRegistry.getStrings(localeId);
    const localeObject = { ...locale, strings };
    return localeObject;
  };

const typeDefs = `type Locale {
  id: String,
  label: String
  dynamic: Boolean
  strings: JSON
}

type Query {
  locale(localeId: String): Locale
}
`;
const resolvers = (registries) => ({
  Query: {
    locale: locale(registries),
  },
});

//addGraphQLQuery("locale(localeId: String): Locale");
//addGraphQLResolvers({ Query: { locale } });

/**
 * To be merged in your own schema
 */
export const graphql = {
  typeDefs,
  makeResolvers: (registries: {
    LocalesRegistry: LocalesRegistry;
    StringsRegistry: StringsRegistry;
  }) => resolvers(registries),
};
