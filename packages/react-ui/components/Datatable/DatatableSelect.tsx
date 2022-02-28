import React from "react";
import { useVulcanComponents } from "../VulcanComponents";

/*

DatatableSelect Component

*/
export const DatatableSelect = ({ toggleItem, selectedItems, document }) => {
  const value = selectedItems.includes(document._id);
  const onChange = (e) => {
    toggleItem(document._id);
  };
  const Components = useVulcanComponents();
  return (
    <Components.DatatableCellLayout className="datatable-check">
      <Components.FormComponentCheckbox
        inputProperties={{ value, onChange }}
        itemProperties={{ layout: "elementOnly" }}
      />
    </Components.DatatableCellLayout>
  );
};
