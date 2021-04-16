/**
 * Change compared to Vulcan:
 * - using a model instead of a collectionName
 */
import React from "react";
import PropTypes from "prop-types";
import { useCoreComponents } from "./CoreComponentsContext";
import { canDeleteDocument } from "@vulcanjs/permissions";

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
  const CoreComponents = useCoreComponents();
  return (
    <div className="form-submit">
      <CoreComponents.Button type="submit" variant="primary">
        {submitLabel ? (
          submitLabel
        ) : (
          <CoreComponents.FormattedMessage
            id="forms.submit"
            defaultMessage="Submit"
          />
        )}
      </CoreComponents.Button>

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
            <CoreComponents.FormattedMessage
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
            <CoreComponents.FormattedMessage
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
          <CoreComponents.Button
            variant="link"
            onClick={deleteDocument}
            className={`delete-link ${model.name}-delete-link`}
          >
            <CoreComponents.Icon name="close" />{" "}
            <CoreComponents.FormattedMessage
              id="forms.delete"
              defaultMessage="Delete"
            />
          </CoreComponents.Button>
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
