import { VulcanDocument } from "@vulcanjs/schema";
import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

export interface DatatableSelectControlledProps {
  selectedItems: Array<string>;
  toggleItem: (itemId: string) => void;
}
export interface DatatableSelectProps extends DatatableSelectControlledProps {
  document: VulcanDocument;
}
/*

DatatableSelect Component

*/
export const DatatableSelect = ({
  toggleItem,
  selectedItems,
  document,
}: DatatableSelectProps) => {
  const value = selectedItems.includes(document._id || "");
  const onChange = (e) => {
    if (!document._id) throw new Error("Cannot toggle item without _id");
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
