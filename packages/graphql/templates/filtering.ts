import { convertToGraphQL } from "./types";
import { capitalize } from "@vulcanjs/utils";

/* ------------------------------------- Selector Types ------------------------------------- */

/*

The selector type is used to query for one or more documents

type MovieSelectorInput {
  AND: [MovieSelectorInput]
  OR: [MovieSelectorInput]
  ...
}

// TODO: not currently used

*/
export const selectorInputType = (typeName) => `${typeName}SelectorInput`;
export const selectorInputTemplate = ({ typeName, fields }) =>
  `input ${selectorInputType(typeName)} {
  _and: [${selectorInputType(typeName)}]
  _or: [${selectorInputType(typeName)}]
${convertToGraphQL(fields, "  ")}
}`;

/*

The unique selector type is used to query for exactly one document

type MovieSelectorUniqueInput {
  _id: String
  slug: String
}

*/
export const selectorUniqueInputType = (typeName) =>
  `${typeName}SelectorUniqueInput`;
export const selectorUniqueInputTemplate = ({ typeName, fields }) =>
  `input ${selectorUniqueInputType(typeName)} {
${convertToGraphQL(fields, "  ")}
}`;

const formatFilterName = (s) => capitalize(s.replace("_", ""));

/*

See https://docs.hasura.io/1.0/graphql/manual/queries/query-filters.html#
 
*/
export const filterInputType = (typeName) => `${typeName}FilterInput`;
export const fieldFilterInputTemplate = ({
  typeName,
  fields,
  customFilters = [],
  customSorts = [],
}: {
  typeName: string;
  fields: Array<any>;
  customFilters?: Array<any>;
  customSorts?: Array<any>;
}) =>
  `input ${filterInputType(typeName)} {
  _and: [${filterInputType(typeName)}]
  _not: ${filterInputType(typeName)}
  _or: [${filterInputType(typeName)}]
${customFilters.map(
  (filter) => `  ${filter.name}: ${customFilterType(typeName, filter)}`
)}
${customSorts.map(
  (sort) => `  ${sort.name}: ${customSortType(typeName, sort)}`
)}
${fields
  .map((field) => {
    const { name, type } = field;
    return `${name}: ${type}`;
  })
  .join("\n")}
}`;

export const sortInputType = (typeName) => `${typeName}SortInput`;
export const fieldSortInputTemplate = ({ typeName, fields }) =>
  `input ${sortInputType(typeName)} {
${fields.map(({ name }) => `  ${name}: SortOptions`).join("\n")}
}`;

export const customFilterType = (typeName, filter) =>
  `${typeName}${formatFilterName(filter.name)}FilterInput`;
export const customFilterTemplate = ({ typeName, filter }) =>
  `input ${customFilterType(typeName, filter)}{
  ${filter.arguments}
}`;

// TODO: not currently used
export const customSortType = (typeName, filter) =>
  `${typeName}${formatFilterName(filter.name)}SortInput`;
export const customSortTemplate = ({ typeName, sort }) =>
  `input ${customSortType(typeName, sort)}{
  ${sort.arguments}
}`;

// export const customFilterTemplate = ({ typeName, customFilters }) =>
//   `enum ${typeName}CustomFilter{
// ${Object.keys(customFilters).map(name => `  ${name}`).join('\n')}
// }`;

// export const customSortTemplate = ({ typeName, customFilters }) =>
//   `enum ${typeName}CustomSort{
// ${Object.keys(customFilters).map(name => `  ${name}`).join('\n')}
// }`;

/*
export const orderByInputTemplate = ({ typeName, fields }) =>
  `enum ${typeName}SortInput {
  ${Array.isArray(fields) && fields.length ? fields.join('\n  ') : 'foobar'}
}`;
*/
