/**
 *
 * // Copied for bootstrap package
 * // TODO: find a more generic implementation
 *
 * Ideally for such a rich component we should also expose
 * hooks and internal logic so users can build their own
 */
import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
import React, { useState } from "react";
// TODO: @see packages/vulcan-lib/lib/modules/fragments.js
import { expandQueryFragments } from "meteor/vulcan:core";
import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useVulcanComponents } from "../VulcanComponents/Consumer";

export const MultiAutocomplete = (props) => {
  const {
    queryData,
    updateCurrentValues,
    refFunction,
    path,
    inputProperties = {},
    itemProperties = {},
    autocompleteQuery,
    optionsFunction,
    formComponents,
  } = props;

  const Components = useVulcanComponents();
  // MergeWithComponents should be handled at the Form level
  // by creating a new VulcanComponents context that merges default components
  // and components passed via props
  //const Components = mergeWithComponents(formComponents);

  const { value, label } = inputProperties;

  // store current autocomplete query string in local component state
  const [queryString, setQueryString] = useState();

  // get component's autocomplete query and use it to load autocomplete suggestions
  // note: we use useLazyQuery because
  // we don't want to trigger the query until the user has actually typed in something
  const [loadAutocompleteOptions, { loading, error, data }] = useLazyQuery(
    gql(expandQueryFragments(autocompleteQuery())),
    {
      variables: { queryString },
    }
  );

  if (error) {
    // TODO: probably not the best way to displat the error
    throw new Error(error.message);
  }
  // apply options function to data to get suggestions in { value, label } pairs
  const autocompleteOptions = data && optionsFunction({ data });

  // apply same function to loaded data; filter by current value to avoid displaying any
  // extra unwanted items if field-level data loading loaded too many items
  const selectedItems =
    queryData &&
    optionsFunction({ data: queryData }).filter((d) => value.includes(d.value));

  // console.log(queryData)
  // console.log(queryData && optionsFunction({ data: queryData }));
  // console.log(value)
  // console.log(selectedItems)

  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <AsyncTypeahead
        {...inputProperties}
        multiple
        onChange={(selected) => {
          const selectedIds = selected.map(({ value }) => value);
          updateCurrentValues({ [path]: selectedIds });
        }}
        options={autocompleteOptions}
        id={path}
        ref={refFunction}
        onSearch={(queryString) => {
          setQueryString(queryString);
          loadAutocompleteOptions();
        }}
        isLoading={loading}
        selected={selectedItems}
      />
    </Components.FormItem>
  );
};

//registerComponent("FormComponentMultiAutocomplete", MultiAutocomplete);
