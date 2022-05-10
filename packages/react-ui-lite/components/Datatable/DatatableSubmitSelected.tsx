import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

/*

DatatableSelect Component

*/
export const DatatableSubmitSelected = ({
  selectedItems,
  onSubmitSelected,
}) => {
  const Components = useVulcanComponents();

  return (
    <Components.Button
      className="datatable-submit-selected"
      onClick={(e) => {
        e.preventDefault();
        onSubmitSelected(selectedItems);
      }}
    >
      <Components.FormattedMessage id="datatable.submit" />
    </Components.Button>
  );
};
