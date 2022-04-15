import React from "react";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { formatLabel } from "@vulcanjs/i18n";
import { VulcanModel } from "@vulcanjs/model";
import { useVulcanComponents } from "../VulcanComponents";

export interface DatatableColumnDefinition {
  name: string;
  label?: string;
  options?: any;
  filterComponent?: any;
  sortable?: boolean;
  filterable?: boolean;
}
/*

DatatableHeader Component

*/
export const DatatableHeader = ({
  model,
  column,
  toggleSort,
  currentSort,
  submitFilters,
  currentFilters,
}: {
  model: VulcanModel;
  column: DatatableColumnDefinition;
  // TODO: reuse this type
  toggleSort?: any;
  currentSort?: any;
  submitFilters?: any;
  currentFilters?: any;
}) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  // column label
  let formattedLabel;

  if (model) {
    const schema = model.schema;
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
        collectionName: model.name,
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
            name={column.name}
            label={formattedLabel}
            toggleSort={toggleSort}
            currentSort={currentSort}
            // TODO: those props were maybe needed when extending this component?
            // They are not used by the default version though
            //model={model}
            //field={field}
            //sortable={column.sortable}
          />
        )}
        {column.filterable && (
          <Components.DatatableFilter
            model={model}
            field={field}
            name={column.name}
            label={formattedLabel}
            query={filterQuery}
            options={filterOptions}
            submitFilters={submitFilters}
            columnFilters={currentFilters[column.name]}
            filterComponent={column.filterComponent}
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
