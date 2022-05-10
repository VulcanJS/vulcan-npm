import { useIntlContext } from "@vulcanjs/react-i18n";
import { VulcanDocument } from "@vulcanjs/schema";
import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

export const EditButton = ({
  style = "primary",
  variant,
  label,
  size,
  showId,
  modalProps,
  formProps,
  component,
  ...props
}) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  return (
    <Components.ModalTrigger
      label={
        label ||
        intl.formatMessage({ id: "datatable.edit", defaultMessage: "Edit" })
      }
      component={
        component ? (
          component
        ) : (
          <Components.Button size={size} variant={variant || style}>
            {label || (
              <Components.FormattedMessage
                id="datatable.edit"
                defaultMessage="Edit"
              />
            )}
          </Components.Button>
        )
      }
      modalProps={modalProps}
    >
      <Components.EditForm
        closeModal={() => {
          console.warn("closeModal not defined");
        }}
        {...props}
        formProps={formProps}
      />
    </Components.ModalTrigger>
  );
};

/*

EditForm Component

*/
export const EditForm = ({
  closeModal,
  successCallback,
  removeSuccessCallback,
  formProps,
  ...props
}: {
  successCallback?: (document: VulcanDocument) => void;
  closeModal: () => void;
  removeSuccessCallback?: (document: VulcanDocument) => void;
  formProps?: any;
}) => {
  const Components = useVulcanComponents();
  const success = successCallback
    ? (document) => {
      successCallback(document);
      closeModal();
    }
    : () => {
      closeModal();
    };

  const remove = removeSuccessCallback
    ? (document) => {
      removeSuccessCallback(document);
      closeModal();
    }
    : () => {
      closeModal();
    };

  return (
    <Components.SmartForm
      successCallback={success}
      removeSuccessCallback={remove}
      {...formProps}
      {...props}
    />
  );
};
