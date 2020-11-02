/**
 * Generate GraphQL final typedefs
 */
import { MutationSchema, QuerySchema } from "./typings";

// schema generation
export const generateQueryTypeDefs = (
  queries: Array<QuerySchema> = []
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

export const generateMutationTypeDefs = (
  mutations: Array<MutationSchema> = []
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

/*
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
/*
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
*/
// export default generateTypeDefs;
