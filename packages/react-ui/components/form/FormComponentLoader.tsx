/**
 * Changes from Vulcan Meteor:
 * - query is not expanded: you need to pass the full query with fragments already
 */
import React, { useEffect } from "react";
// @see packages/vulcan-lib/lib/modules/fragments.js in Vulcan
// should we reenable this?
// import { expandQueryFragments } from "meteor/vulcan:core";
import { useLazyQuery, gql } from "@apollo/client";
import isEmpty from "lodash/isEmpty";
import { useVulcanComponents } from "./VulcanComponents/Consumer";

export interface FormComponentLoaderProps {
  query: string | (({ value: any }) => string);
  children: React.ReactNode;
  options: any;
  value: any;
  /** Run the query only when value is not empty */
  queryWaitsForValue?: boolean;
}
export const FormComponentLoader = (props: FormComponentLoaderProps) => {
  const VulcanComponents = useVulcanComponents();
  const { query, children, options, value, queryWaitsForValue } = props;

  // if query is a function, execute it
  const queryText = typeof query === "function" ? query({ value }) : query;

  const [loadFieldQuery, { loading, error, data }] = useLazyQuery(
    gql(queryText)
    // gql(expandQueryFragments(queryText))
  );

  const valueIsEmpty =
    isEmpty(value) || (Array.isArray(value) && value.length) === 0;

  useEffect(() => {
    if (queryWaitsForValue && valueIsEmpty) {
      // we don't want to run this query until we have a value to pass to it
      // so do nothing
    } else {
      loadFieldQuery({
        variables: { value },
      });
    }
  }, [valueIsEmpty, value, queryWaitsForValue]);

  if (error) {
    throw new Error(error.toString());
  }

  if (loading) {
    return (
      <div className="form-component-loader">
        <VulcanComponents.Loading />
      </div>
    );
  }

  // pass newly loaded data (and options if needed) to child component
  const extraProps: {
    data: any;
    queryData: any;
    queryError: any;
    loading: boolean;
    optionsFunction?: Function;
    options?: Array<any>;
  } = { data, queryData: data, queryError: error, loading };
  if (typeof options === "function") {
    extraProps.optionsFunction = options;
    extraProps.options = options.call({}, { ...props, data });
  }
  if (!React.isValidElement(children)) {
    throw new Error(
      "Children of FormComponentLoader must be a React element, got " + children
    );
  }
  const fci = React.cloneElement(children, extraProps);

  return <div className="form-component-loader">{fci}</div>;
};

FormComponentLoader.propTypes = {};
