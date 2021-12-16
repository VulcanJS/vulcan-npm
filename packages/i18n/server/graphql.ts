/**
 * In the future we might want to standardize those exports
 * @see https://github.com/VulcanJS/vulcan-next/issues/9
 */
import { getLocale, getStrings } from "../intl";

//addGraphQLSchema(localeType);

const locale = async (root, { localeId }, context) => {
  const locale = getLocale(localeId);
  const strings = getStrings(localeId);
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
const resolvers = {
  Query: { locale },
};

//addGraphQLQuery("locale(localeId: String): Locale");
//addGraphQLResolvers({ Query: { locale } });

/**
 * To be merged in your own schema
 */
export const graphql = {
  typeDefs,
  resolvers,
};
