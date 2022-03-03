import { useIntlContext } from "@vulcanjs/i18n";
import React from "react";
import { useVulcanComponents } from "../../VulcanComponents";

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
      <Components.EditForm {...props} formProps={formProps} />
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
