/**
 *
 * // Copied for bootstrap package
 * // TODO: find a more generic implementation
 * eg using "data-list" property of inputs
 *
 * Ideally for such a rich component we should also expose
 * hooks and internal logic so users can build their own
 */
import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useFormContext } from "@vulcanjs/react-ui";

export const Autocomplete = (props) => {
  const {
    queryData,
    //updateCurrentValues,
    refFunction,
    path,
    inputProperties = {},
    itemProperties = {},
    autocompleteQuery,
    optionsFunction,
    name,
  } = props;

  const Components = useVulcanComponents();
  const { updateCurrentValues } = useFormContext();

  const { value, label } = inputProperties;

  // store current autocomplete query string in local component state
  const [queryString = "xohaskjdhaskdjalh", setQueryString] =
    useState<string>();

  // get component's autocomplete query and use it to load autocomplete suggestions
  // note: we use useLazyQuery because
  // we don't want to trigger the query until the user has actually typed in something
  const [loadAutocompleteOptions, { loading, error, data }] = useLazyQuery(
    gql(autocompleteQuery()),
    {
      variables: { queryString },
    }
  );

  if (error) {
    throw new Error(error.message);
  }
  // apply options function to data to get suggestions in { value, label } pairs
  const autocompleteOptions = data && optionsFunction({ data });

  // apply same function to loaded data; filter by current value to avoid displaying any
  // extra unwanted items if field-level data loading loaded too many items
  // note: should be an array even if there is only one item in it
  const selectedItem = queryData
    ? optionsFunction({ data: queryData }).filter((d) => value === d.value)
    : [];

  return (
    <Components.FormItem
      path={path}
      name={name}
      label={label}
      {...itemProperties}
    >
      <AsyncTypeahead
        {...inputProperties}
        multiple={false}
        onChange={(selected) => {
          if (selected.length === 0) {
            updateCurrentValues({ [path]: null });
          } else {
            // @ts-ignore
            const selectedId = selected[0].value;
            updateCurrentValues({ [path]: selectedId });
          }
        }}
        options={autocompleteOptions}
        id={path}
        ref={refFunction}
        onSearch={(queryString) => {
          setQueryString(queryString);
          loadAutocompleteOptions();
        }}
        isLoading={loading}
        selected={selectedItem}
      />
    </Components.FormItem>
  );
};
