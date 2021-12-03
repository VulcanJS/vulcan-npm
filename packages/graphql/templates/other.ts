import { capitalize } from "@vulcanjs/utils";

export const fieldDynamicQueryName = ({ queryResolverName }) =>
  `FormComponentDynamic${capitalize(queryResolverName)}Query`;

/*

Field-specific data loading query template for a dynamic array of item IDs

(example: `categoriesIds` where $value is ['foo123', 'bar456'])

*/
export const fieldDynamicQueryTemplate = ({
  queryResolverName,
  autocompletePropertyName,
}) =>
  `query ${fieldDynamicQueryName({ queryResolverName })}($value: [String!]) {
    ${queryResolverName}(input: { 
      filter: {  _id: { _in: $value } },
      sort: { ${autocompletePropertyName}: asc }
    }){
      results{
        _id
        ${autocompletePropertyName}
      }
    }
  }
`;

/*

Field-specific data loading query template for *all* items in a collection

*/
export const fieldStaticQueryTemplate = ({
  queryResolverName,
  autocompletePropertyName,
}) =>
  `query FormComponentStatic${capitalize(queryResolverName)}Query {
  ${queryResolverName}(input: { 
    
    sort: { ${autocompletePropertyName}: asc }
  }){
    results{
      _id
      ${autocompletePropertyName}
    }
  }
}
`;

export const autocompleteQueryName = ({
  queryResolverName,
}: {
  queryResolverName: string;
}) => `Autocomplete${capitalize(queryResolverName)}Query`;

/*

Query template for loading a list of autocomplete suggestions

*/
export const autocompleteQueryTemplate = ({
  queryResolverName,
  autocompletePropertyName,
}) => `
  query ${autocompleteQueryName({ queryResolverName })}($queryString: String) {
    ${queryResolverName}(
      input: {
        filter: {
          ${autocompletePropertyName}: { _like: $queryString }
        },
        limit: 20
      }
    ){
      results{
        _id
        ${autocompletePropertyName}
      }
    }
  }
`;
