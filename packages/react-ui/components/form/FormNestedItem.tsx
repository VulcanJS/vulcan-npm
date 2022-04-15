import React from "react";
import PropTypes from "prop-types";
import { intlShape } from "@vulcanjs/react-i18n";
import { useVulcanComponents } from "../VulcanComponents/Consumer";
import { useIntlContext } from "@vulcanjs/react-i18n";

export const FormNestedItemLayout = ({ content, removeButton }) => (
  <div className="form-nested-item">
    <div className="form-nested-item-inner">{content}</div>
    {removeButton && [
      <div key="remove-button" className="form-nested-item-remove">
        {removeButton}
      </div>,
      <div
        key="remove-button-overlay"
        className="form-nested-item-deleted-overlay"
      />,
    ]}
  </div>
);
FormNestedItemLayout.propTypes = {
  content: PropTypes.node.isRequired,
  removeButton: PropTypes.node,
};

export const FormNestedItem = ({
  nestedFields,
  name,
  path,
  removeItem,
  itemIndex,
  formComponents,
  hideRemove,
  label,
  ...props
}) => {
  const VulcanComponents = useVulcanComponents();
  const intl = useIntlContext();
  const isArray = typeof itemIndex !== "undefined";
  return (
    <VulcanComponents.FormNestedItemLayout
      content={nestedFields.map((field, i) => {
        return (
          <VulcanComponents.FormComponent
            key={i}
            {...props}
            {...field}
            path={`${path}.${field.name}`}
            itemIndex={itemIndex}
          />
        );
      })}
      removeButton={
        isArray &&
        !hideRemove && [
          <div key="remove-button" className="form-nested-item-remove">
            <VulcanComponents.Button
              className="form-nested-button"
              variant="danger"
              size="sm"
              iconButton
              tabIndex={-1}
              onClick={() => {
                removeItem(name);
              }}
              aria-label={intl.formatMessage(
                { id: "forms.delete_nested_field" },
                { label: label }
              )}
            >
              <VulcanComponents.IconRemove height={12} width={12} />
            </VulcanComponents.Button>
          </div>,
          <div
            key="remove-button-overlay"
            className="form-nested-item-deleted-overlay"
          />,
        ]
      }
    />
  );
};

FormNestedItem.propTypes = {
  path: PropTypes.string.isRequired,
  itemIndex: PropTypes.number,
  formComponents: PropTypes.object,
  hideRemove: PropTypes.bool,
};

FormNestedItem.contextTypes = {
  errors: PropTypes.array,
  intl: intlShape,
};
