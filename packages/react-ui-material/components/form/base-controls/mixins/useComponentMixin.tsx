/**
 * A rewrite of the "Component" mixin, using hooks
 */
import PropTypes from "prop-types";
import _omit from "lodash/omit";
import classNames from "classnames";

export const useComponentMixin = (props) => {
  const hasErrors = function () {
    return !!(props.errors && props.errors.length);
  };
  const hashString = function (string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = ((hash << 5) - hash + string.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
  };
  return {
    hasErrors,
    hashString,
    propTypes: {
      label: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
      hideLabel: PropTypes.bool,
      layout: PropTypes.string,
      optional: PropTypes.bool,
      errors: PropTypes.arrayOf(PropTypes.object),
      className: PropTypes.string,
      inputType: PropTypes.string,
    },

    getFormControlProperties: function () {
      return {
        label: props.label,
        hideLabel: props.hideLabel,
        layout: props.layout,
        optional: props.optional,
        value: props.value,
        hasErrors: hasErrors(),
        className: classNames(props.className, props.classes?.root),
        inputType: props.inputType,
        required: props.required,
      };
    },

    getFormHelperProperties: function () {
      return {
        help: props.help,
        errors: props.errors,
        hasErrors: hasErrors(),
        showCharsRemaining: props.showCharsRemaining,
        charsRemaining: props.charsRemaining,
        charsCount: props.charsCount,
        max: props.max,
        className: "form-helper-text",
      };
    },

    /**
     * The ID is used as an attribute on the form control, and is used to allow
     * associating the label element with the form control.
     *
     * If we don't explicitly pass an `id` prop, we generate one based on the
     * `name`, `label` and `itemIndex` (for nested forms) properties.
     */
    getId: function () {
      const { id, label = "", name, itemIndex = "" } = props;
      if (id) {
        return id;
      }
      const cleanName = name ? name.split("[").join("_").replace("]", "") : "";
      return [
        "frc",
        cleanName,
        itemIndex,
        hashString(JSON.stringify(label)),
      ].join("-");
    },

    cleanProps: function (props) {
      // TODO: instead we must white label valid HTML fields
      const removedFields = [
        "addItem",
        "addToDeletedValues",
        "addonAfter",
        "addonBefore",
        "afterComponent",
        "allowedValues",
        "arrayField",
        "arrayFieldSchema",
        "autoValue",
        "beforeComponent",
        "blackbox",
        "charsCount",
        "charsRemaining",
        "className",
        "classes",
        "clearField",
        "clearFieldErrors",
        "currentUser",
        "currentValues",
        "custom",
        "deletedValues",
        "description",
        "document",
        "errors",
        "formComponents",
        "formInput",
        "formType",
        "formatValue",
        "getUrl",
        "handleChange",
        "hasErrors",
        "help",
        "hideClear",
        "hideLabel",
        "hideLink",
        "inputClassName",
        "inputComponent",
        "inputProperties",
        "inputProps",
        "inputType",
        "itemDataType",
        "itemIndex",
        "itemProperties",
        "label",
        "labelId",
        "layout",
        "loading",
        "maxCount",
        "minCount",
        "mustComplete",
        "nestedArrayErrors",
        "nestedSchema",
        "networkId",
        "optional",
        "options",
        "optionsFunction",
        "parentFieldName",
        "prefilledProps",
        "queryData",
        "query",
        "queryError",
        "regEx",
        "renderComponent",
        "scrubValue",
        "showCharsRemaining",
        "showMenuIndicator",
        "submitForm",
        "throwError",
        "updateCurrentValues",
        "validateOnSubmit",
        "validatePristine",
        "visibleItemIndex",
        "itemDatatype",
        "limitToList",
        "disableText",
        "disableSelectOnBlur",
        "showAllOptions",
        "disableMatchParts",
        "autoComplete",
        "autoFocus",
        "intlKeys",
      ];

      return _omit(props, removedFields);
    },

    cleanSwitchProps: function (props) {
      const removedFields = ["value", "error", "label"];

      return _omit(props, removedFields);
    },
  };
};
