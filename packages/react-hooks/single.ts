import { useQuery, QueryOptions } from "@apollo/react-hooks";
import gql from "graphql-tag";
import _merge from "lodash/merge";

import { singleClientTemplate } from "@vulcan/graphql";
import { VulcanModel } from "@vulcan/model";

import { computeQueryVariables } from "./variables";
import { OperationVariables } from "apollo-client";
import { QueryInput } from "./typings";

const defaultInput = {
  enableCache: false,
  allowNull: false,
};

export const buildSingleQuery = ({
  typeName,
  fragmentName,
  fragment,
  extraQueries,
}) => {
  const query = gql`
    ${singleClientTemplate({ typeName, fragmentName, extraQueries })}
    ${fragment}
  `;
  return query;
};

/**
 * Create GraphQL useQuery options and variables based on props and provided options
 * @param {*} options
 * @param {*} props
 */
const buildQueryOptions = <TData = any, TVariables = OperationVariables>(
  options,
  props
): Partial<QueryOptions<TData, TVariables>> => {
  let {
    pollInterval = 20000,
    // generic apollo graphQL options
    queryOptions = {},
  } = options;

  // if this is the SSR process, set pollInterval to null
  // see https://github.com/apollographql/apollo-client/issues/1704#issuecomment-322995855
  pollInterval = typeof window === "undefined" ? null : pollInterval;

  // OpenCrud backwards compatibility
  const graphQLOptions: Partial<QueryOptions<TData, any /*TVariables*/>> = {
    variables: {
      ...computeQueryVariables(
        { ...options, input: _merge({}, defaultInput, options.input || {}) }, // needed to merge in defaultInput, could be improved
        props
      ),
    },
    pollInterval, // note: pollInterval can be set to 0 to disable polling (20s by default)
  };

  // see https://www.apollographql.com/docs/react/features/error-handling/#error-policies
  graphQLOptions.errorPolicy = "all";

  return {
    ...graphQLOptions,
    ...queryOptions,
  };
};

const buildResult = (
  options,
  { fragmentName, fragment, resolverName },
  returnedProps
) => {
  const { /* ownProps, */ data, error } = returnedProps;
  const propertyName = options.propertyName || "document";
  const props = {
    ...returnedProps,
    // Note: Scalar types like Dates are NOT converted. It should be done at the UI level.
    [propertyName]: data && data[resolverName] && data[resolverName].result,
    fragmentName,
    fragment,
    data,
    error,
  };
  if (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return props;
};

interface SingleInput extends QueryInput {
  id?: string;
  allowNull?: boolean; // if false, throw an error when not found
}
interface UseSingleOptions {
  model: VulcanModel;
  input?: SingleInput;
  fragment?: string;
  fragmentName?: string;
  extraQueries?: string;
}

export const useSingle = (options: UseSingleOptions, props = {}) => {
  let {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    extraQueries,
  } = options;

  const { typeName, singleResolverName: resolverName } = model.graphql;

  const query = buildSingleQuery({
    typeName,
    fragmentName,
    fragment,
    extraQueries,
  });

  const queryRes = useQuery(query, buildQueryOptions(options, props));
  const result = buildResult(
    options,
    { fragment, fragmentName, resolverName },
    queryRes
  );
  return result;
};
