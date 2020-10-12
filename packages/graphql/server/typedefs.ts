/**
 * Generate GraphQL final typedefs
 */

// schema generation
const generateQueryTypeDefs = (
  queries: Array<{ description: string; query: string }> = []
): string =>
  queries.length === 0
    ? ""
    : `type Query {
${queries
  .map(
    (q) =>
      `${
        q.description
          ? `  # ${q.description}
`
          : ""
      }  ${q.query}
  `
  )
  .join("\n")}
}
  `;

const generateMutationTypeDefs = (
  mutations: Array<{ description: string; mutation: string }> = []
): string =>
  mutations.length === 0
    ? ""
    : `type Mutation {
${mutations
  .map(
    (m) =>
      `${
        m.description
          ? `  # ${m.description}
`
          : ""
      }  ${m.mutation}
`
  )
  .join("\n")}
}
`;

const commonTypeDefs = `
scalar JSON
scalar Date

# see https://docs.hasura.io/1.0/graphql/manual/queries/query-filters.html

input String_Selector {
  _eq: String
  #_gt: String
  #_gte: String
  #_ilike: String
  _in: [String!]
  _is_null: Boolean
  _like: String
  #_lt: String
  #_lte: String
  #_neq: String
  #_nilike: String
  #_nin: [String!]
  #_nlike: String
  #_nsimilar: String
  #_similar: String
}

input String_Array_Selector {
  _in: [String!]
  _contains: String
  # _contains_all: [String_Selector]
}

input Int_Selector {
  _eq: Int
  _gt: Int
  _gte: Int
  _in: [Int!]
  #_is_null: Boolean
  _lt: Int
  _lte: Int
  #_neq: Int
  #_nin: [Int!]
}

input Int_Array_Selector {
  contains: Int_Selector
  # contains_all: [Int_Selector]
}

input Float_Selector {
  _eq: Float
  _gt: Float
  _gte: Float
  _in: [Float!]
  #_is_null: Boolean
  _lt: Float
  _lte: Float
  #_neq: Float
  #_nin: [Float!]
}

input Float_Array_Selector {
  contains: Float_Selector
  # contains_all: [Float_Selector]
}

input Boolean_Selector {
  _eq: Boolean
  #_neq: Boolean
}

input Boolean_Array_Selector {
  contains: Boolean_Selector
  # contains_all: [Boolean_Selector]
}

input Date_Selector {
  _eq: Date
  _gt: Date
  _gte: Date
  _in: [Date!]
  #_is_null: Boolean
  _lt: Date
  _lte: Date
  #_neq: Date
  #_nin: [Date!]
}

input Date_Array_Selector {
  contains: Date_Selector
  # contains_all: [Date_Selector]
}

# column ordering options
enum SortOptions {
  asc
  desc
}

input OptionsInput {
  # Whether to enable caching for this query
  enableCache: Boolean
  # For single document queries, return null instead of throwing MissingDocumentError
  allowNull: Boolean
}`;

interface GenerateTypeDefsInput {
  additionalTypeDefs?: string;
  modelTypeDefs?: string;
  queries: Array<{ description: string; query: string }>;
  mutations: Array<{ description: string; mutation: string }>;
}
/**
 *
 * @param param0
 * @param GraphQLSchema
 */
export const generateTypeDefs = ({
  additionalTypeDefs,
  modelTypeDefs,
  queries,
  mutations,
}: GenerateTypeDefsInput): Array<string> => [
  `
  ${commonTypeDefs}

${additionalTypeDefs}

${modelTypeDefs}

${generateQueryTypeDefs(queries)}

${generateMutationTypeDefs(mutations)}

`,
];

export default generateTypeDefs;
