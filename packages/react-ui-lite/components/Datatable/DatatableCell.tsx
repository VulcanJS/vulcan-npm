import { VulcanModel } from "@vulcanjs/model";
import { VulcanUser } from "@vulcanjs/permissions";
import { VulcanDocument } from "@vulcanjs/schema";
import React from "react";
import {
  PossibleVulcanComponents,
  useVulcanComponents,
} from "@vulcanjs/react-ui";

/*

DatatableCell Component

*/
export const DatatableCell = ({
  column,
  document,
  currentUser,
  model,
}: {
  column: {
    /** TODO: type should be more precise */
    component?: React.ComponentType<any>;
    /** @deprecated Prefer passing a component directly, except for Vulcan core form components
     * TODO: it should more precisely accept Cell components, they need to be listed specifically
     *
     */
    componentName?: keyof PossibleVulcanComponents;
    name?: string;
    label?: string;
  };
  document?: VulcanDocument;
  currentUser?: VulcanUser;
  model: VulcanModel;
}) => {
  const Components = useVulcanComponents();
  const Component =
    column.component ||
    (column.componentName && Components[column.componentName]) ||
    Components.DatatableDefaultCell;
  const columnName = column.label || column.name;
  if (!columnName) throw new Error("Column should have name or label");

  return (
    <Components.DatatableCellLayout
      className={`datatable-item-${columnName
        .toLowerCase()
        .replace(/\s/g, "-")}`}
    >
      <Component
        column={column}
        document={document}
        currentUser={currentUser}
        model={model}
      />
    </Components.DatatableCellLayout>
  );
};

export const DatatableCellLayout = ({ children, ...otherProps }) => (
  <td {...otherProps}>
    <div className="cell-contents">{children}</div>
  </td>
);

/*

DatatableDefaultCell Component

*/
export const DatatableDefaultCell = ({ column, document, ...rest }) => {
  const Components = useVulcanComponents();
  return (
    <Components.CardItemSwitcher
      value={document[column.name]}
      document={document}
      fieldName={column.name}
      {...column}
      {...rest}
    />
  );
};
