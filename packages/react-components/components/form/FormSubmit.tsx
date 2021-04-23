/**
 * Change compared to Vulcan:
 * - using a model instead of a collectionName
 */
import React from "react";
import PropTypes from "prop-types";
import { canDeleteDocument } from "@vulcanjs/permissions";
import { useVulcanComponents } from "./VulcanComponentsContext";

export const FormSubmit = (
  {
    submitForm,
    submitLabel,
    cancelLabel,
    cancelCallback,
    revertLabel,
    revertCallback,
    document,
    deleteDocument,
    model,
    classes,
    currentUser,
  },
  { isChanged, clearForm }
) => {
  const VulcanComponents = useVulcanComponents();
  return (
    <div className="form-submit">
      <VulcanComponents.Button type="submit" variant="primary">
        {submitLabel ? (
          submitLabel
        ) : (
          <VulcanComponents.FormattedMessage
            id="forms.submit"
            defaultMessage="Submit"
          />
        )}
      </VulcanComponents.Button>

      {cancelCallback ? (
        <a
          className="form-cancel"
          onClick={(e) => {
            e.preventDefault();
            cancelCallback(document);
          }}
        >
          {cancelLabel ? (
            cancelLabel
          ) : (
            <VulcanComponents.FormattedMessage
              id="forms.cancel"
              defaultMessage="Cancel"
            />
          )}
        </a>
      ) : null}

      {revertCallback ? (
        <a
          className="form-cancel"
          onClick={(e) => {
            e.preventDefault();
            clearForm();
            revertCallback(document);
          }}
        >
          {revertLabel ? (
            revertLabel
          ) : (
            <VulcanComponents.FormattedMessage
              id="forms.revert"
              defaultMessage="Revert"
            />
          )}
        </a>
      ) : null}

      {deleteDocument &&
      canDeleteDocument({
        user: currentUser,
        document,
        model,
      }) ? (
        <div>
          <hr />
          <VulcanComponents.Button
            variant="link"
            onClick={deleteDocument}
            className={`delete-link ${model.name}-delete-link`}
          >
            <VulcanComponents.Icon name="close" />{" "}
            <VulcanComponents.FormattedMessage
              id="forms.delete"
              defaultMessage="Delete"
            />
          </VulcanComponents.Button>
        </div>
      ) : null}
    </div>
  );
};

FormSubmit.propTypes = {
  submitLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  cancelCallback: PropTypes.func,
  revertLabel: PropTypes.node,
  revertCallback: PropTypes.func,
  document: PropTypes.object,
  deleteDocument: PropTypes.func,
  collectionName: PropTypes.string,
  classes: PropTypes.object,
};

FormSubmit.contextTypes = {
  isChanged: PropTypes.func,
  clearForm: PropTypes.func,
};
