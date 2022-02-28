import React, { memo } from "react";
import _isFunction from "lodash/isFunction";
import { useVulcanComponents } from "../VulcanComponents";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import { isAdmin } from "@vulcanjs/permissions";

/*

DatatableRow Component

*/
export const DatatableRow = (props: {
  model: VulcanGraphqlModel;
  columns;
  document;
  showEdit;
  showDelete;
  currentUser;
  options;
  editFormOptions;
  editFormProps;
  rowClass;
  showSelect;
  toggleItem;
  selectedItems;
  modalProps?: any;
}) => {
  const {
    model,
    columns,
    document,
    showEdit,
    showDelete,
    currentUser,
    options,
    editFormOptions,
    editFormProps,
    rowClass,
    showSelect,
    toggleItem,
    selectedItems,
  } = props;
  const Components = useVulcanComponents();

  let canUpdate = false;

  // new APIs
  const permissionCheck = model.permissions.canUpdate;
  //get(collection, "options.permissions.canUpdate");
  // openCRUD backwards compatibility
  //const check =
  //  get(collection, "options.mutations.edit.check") ||
  //  get(collection, "options.mutations.update.check");

  if (isAdmin(currentUser)) {
    canUpdate = true;
  } else if (permissionCheck) {
    canUpdate = permissionCheck({
      check: permissionCheck,
      user: currentUser,
      document,
      context: { Users },
      operationName: "update",
    });
  } /*
  legacy
  else if (check) {
    canUpdate = check && check(currentUser, document, { Users });
  }*/

  const row =
    typeof rowClass === "function" ? rowClass(document) : rowClass || "";
  const { modalProps = {} } = props;
  const defaultModalProps = { title: <code>{document._id}</code> };
  const customModalProps = {
    ...defaultModalProps,
    ...(_isFunction(modalProps) ? modalProps(document) : modalProps),
  };

  const isSelected = selectedItems && selectedItems.includes(document._id);

  return (
    <Components.DatatableRowLayout
      className={`datatable-item ${row} ${
        isSelected ? "datatable-item-selected" : ""
      }`}
    >
      {showSelect && (
        <Components.DatatableSelect
          Components={Components}
          document={document}
          currentUser={currentUser}
          collection={collection}
          toggleItem={toggleItem}
          selectedItems={selectedItems}
        />
      )}
      {columns.map((column, index) => (
        <Components.DatatableCell
          key={index}
          Components={Components}
          column={column}
          document={document}
          currentUser={currentUser}
          collection={collection}
        />
      ))}
      {showEdit && canUpdate ? ( // openCRUD backwards compatibility
        <Components.DatatableCellLayout className="datatable-edit">
          <Components.EditButton
            collection={collection}
            documentId={document._id}
            currentUser={currentUser}
            mutationFragmentName={options && options.fragmentName}
            modalProps={customModalProps}
            {...editFormOptions}
            {...editFormProps}
          />
        </Components.DatatableCellLayout>
      ) : null}
      {showDelete && canUpdate ? ( // openCRUD backwards compatibility
        <Components.DatatableCellLayout className="datatable-delete">
          <Components.DeleteButton
            collection={collection}
            documentId={document._id}
            currentUser={currentUser}
            mutationFragmentName={options && options.fragmentName}
          />
        </Components.DatatableCellLayout>
      ) : null}
    </Components.DatatableRowLayout>
  );
};
export const DatatableRowLayout = ({ children, ...otherProps }) => (
  <tr {...otherProps}>{children}</tr>
);
