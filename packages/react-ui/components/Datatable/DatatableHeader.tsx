import React, { memo } from "react";
import PropTypes from "prop-types";
import { formatLabel, useIntlContext } from "@vulcanjs/i18n";

/*

DatatableHeader Component

*/
export const DatatableHeader = ({
  collection,
  column,
  toggleSort,
  currentSort,
  submitFilters,
  currentFilters,
  Components,
}) => {
  const intl = useIntlContext();
  // column label
  let formattedLabel;

  if (collection) {
    const schema = collection.simpleSchema()._schema;
    const field = schema[column.name];

    if (column.label) {
      formattedLabel = column.label;
    } else {
      /*
  
      use either:
  
      1. the column name translation : `${collectionName}.${columnName}`, `global.${columnName}`, columnName
      2. the column name label in the schema (if the column name matches a schema field)
      3. the raw column name.
  
      */
      formattedLabel = formatLabel({
        intl,
        fieldName: column.name,
        collectionName: collection._name,
        schema: schema,
      });
    }

    const fieldOptions = field && field.options;

    // for filter options, use either column.options or else the options property defined on the schema field
    const filterOptions = column.options ? column.options : fieldOptions;
    const filterQuery = field && field.staticQuery;

    return (
      <Components.DatatableHeaderCellLayout
        className={`datatable-header-${column.name}`}
      >
        <span className="datatable-header-cell-label">{formattedLabel}</span>
        {column.sortable && (
          <Components.DatatableSorter
            collection={collection}
            field={field}
            name={column.name}
            label={formattedLabel}
            toggleSort={toggleSort}
            currentSort={currentSort}
            sortable={column.sortable}
            Components={Components}
          />
        )}
        {column.filterable && (
          <Components.DatatableFilter
            collection={collection}
            field={field}
            name={column.name}
            label={formattedLabel}
            query={filterQuery}
            options={filterOptions}
            submitFilters={submitFilters}
            columnFilters={currentFilters[column.name]}
            filterComponent={column.filterComponent}
            Components={Components}
          />
        )}
      </Components.DatatableHeaderCellLayout>
    );
  } else {
    const formattedLabel =
      column.label ||
      intl.formatMessage({ id: column.name, defaultMessage: column.name });
    return (
      <Components.DatatableHeaderCellLayout
        className={`datatable-th-${formattedLabel
          .toLowerCase()
          .replace(/\s/g, "-")}`}
      >
        {formattedLabel}
      </Components.DatatableHeaderCellLayout>
    );
  }
};

export const DatatableHeaderCellLayout = ({ children, ...otherProps }) => (
  <th {...otherProps}>
    <div className="datatable-header-cell-inner">{children}</div>
  </th>
);
