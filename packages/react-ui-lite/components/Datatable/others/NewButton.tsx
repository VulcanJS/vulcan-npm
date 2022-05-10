import { useIntlContext } from "@vulcanjs/react-i18n";
import { VulcanModel } from "@vulcanjs/model";
import { VulcanDocument } from "@vulcanjs/schema";
import React from "react";
import type { SmartFormProps, ButtonProps } from "@vulcanjs/react-ui"
import { useVulcanComponents } from "@vulcanjs/react-ui";

export const NewButton = ({
  size,
  label,
  style = "primary",
  formProps,
  ...props
}: {
  model: VulcanModel;
  label?: string;
  formProps?: Partial<SmartFormProps>;
} & Pick<ButtonProps, "size"> & {
  style?: ButtonProps["variant"];
} & NewFormProps) => {
  const intl = useIntlContext();
  const Components = useVulcanComponents();
  return (
    <Components.ModalTrigger
      label={label || intl.formatMessage({ id: "datatable.new" })}
      title={label || intl.formatMessage({ id: "datatable.new" })}
      component={
        <Components.Button variant={style} size={size}>
          {label || <Components.FormattedMessage id="datatable.new" />}
        </Components.Button>
      }
    >
      <Components.NewForm formProps={formProps} {...props} />
    </Components.ModalTrigger>
  );
};

export interface NewFormProps {
  model: VulcanModel;
  successCallback?: (document: VulcanDocument) => void;
  closeModal: () => void;
  formProps?: Partial<SmartFormProps>;
}
/*

NewForm Component

*/
export const NewForm = ({
  model,
  closeModal,
  successCallback,
  formProps,
}: NewFormProps) => {
  const Components = useVulcanComponents();
  const success = successCallback
    ? (document) => {
      successCallback(document);
      closeModal();
    }
    : () => {
      closeModal();
    };

  return (
    <Components.SmartForm
      model={model}
      successCallback={success}
      {...(formProps || {})}
    />
  );
};
