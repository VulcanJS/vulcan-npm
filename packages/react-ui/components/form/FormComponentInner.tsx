import React, { MouseEventHandler } from "react";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { whitelistInputProps } from "./ui_utils";
import { FormComponentProps } from "./FormComponent";
/*
import {
  instantiateComponent,
  whitelistInputProps,
} from "meteor/vulcan:core";
*/
import classNames from "classnames";
import { VulcanCoreInput } from "@vulcanjs/schema";
import { PossibleVulcanComponents } from "../VulcanComponents/typings";
import { clearableInputs } from "./inputs/consts";
import { useVulcanComponents } from "../VulcanComponents/Consumer";

export interface FormComponentInnerProps extends FormComponentProps {
  inputType: VulcanCoreInput;
  //disabled?: boolean;
  // help?: string;
  /**
   * Callback called when clicking on the "clear input" button
   */
  clearField?: MouseEventHandler<HTMLButtonElement>;
  /**
   * TODO: not sure if it should be mandatory or not (eg for uncontrolled components?)
   */
  handleChange?: Function;
  itemProperties?: any;
  description?: string;
  loading?: boolean;
  submitForm: any;
  formComponents: PossibleVulcanComponents;
  intlKeys?: any;
  inputClassName: any;
  name?: string;
  input: any;
  beforeComponent: any;
  afterComponent: any;
  errors: any;
  showCharsRemaining: any;
  charsRemaining: any;
  renderComponent: any;
  formInput: any;
}

export const FormComponentInner = (props: FormComponentInnerProps) => {
  const intl = useIntlContext();
  const { inputType, disabled, clearField } = props;

  const renderClear = () => {
    if (clearableInputs.includes(inputType) && !disabled) {
      /*
      From bootstrap:
        <Components.TooltipTrigger
          trigger={
            <button
              className="form-component-clear"
              title={this.context.intl.formatMessage({
                id: "forms.clear_field",
              })}
              onClick={this.props.clearField}
            >
              <span>✕</span>
            </button>
          }
        >
          <Components.FormattedMessage id="forms.clear_field" />
        </Components.TooltipTrigger>
        */
      return (
        <button
          className="form-component-clear"
          title={intl.formatMessage({
            id: "forms.clear_field",
          })}
          onClick={clearField}
        >
          <span>✕</span>
        </button>
      );
    }
  };

  const getProperties = (): FormInputProps => {
    const {
      handleChange,
      inputType,
      itemProperties,
      help,
      description,
      loading,
      submitForm,
      formComponents,
      intlKeys,
    } = props;
    const properties = {
      ...props,
      inputProperties: {
        ...whitelistInputProps(props),
        onChange: (event) => {
          // FormComponent's handleChange expects value as argument; look in target.checked or target.value
          const inputValue =
            inputType === "checkbox"
              ? // TODO: not sure why we need an ignore there
                // @ts-ignore
                event.target.checked
              : // @ts-ignore
                event.target.value;
          if (handleChange) {
            handleChange(inputValue);
          }
        },
        /*
        TODO: check if this creates regression
        onKeyPress: (event) => {
          if (event.key === "Enter" && inputType !== "textarea") {
            submitForm();
          }
        },
        */
      },

      itemProperties: {
        ...itemProperties,
        intlKeys,
        Components: formComponents,
        description: description || help,
        loading,
      },
    };
    return properties;
  };

  const {
    inputClassName,
    name,
    input,
    //inputType,
    beforeComponent,
    afterComponent,
    errors,
    showCharsRemaining,
    charsRemaining,
    renderComponent,
    formInput,
  } = props;

  const FormComponents = useVulcanComponents();
  //const FormComponents = formComponents;

  const hasErrors = errors && errors.length;

  const inputName = typeof input === "function" ? input.name : inputType;
  const inputClass = classNames(
    "form-input",
    inputClassName,
    `input-${name}`,
    `form-component-${inputName || "default"}`,
    {
      "input-error": hasErrors,
    }
  );
  const properties = getProperties();

  const FormInput = formInput;

  return (
    <div className={inputClass}>
      {/*instantiateComponent(beforeComponent, properties)*/}
      <FormInput {...properties} />
      {hasErrors ? <FormComponents.FieldErrors errors={errors} /> : null}
      {renderClear()}
      {showCharsRemaining && (
        <div
          className={classNames("form-control-limit", {
            danger: charsRemaining < 10,
          })}
        >
          {charsRemaining}
        </div>
      )}
      {/*instantiateComponent(afterComponent, properties)*/}
    </div>
  );
};

/**
 * Props passed to Vulcan Smart Form input
 * Use those props to define custom inputs
 */
export interface FormInputProps<TInput = HTMLInputElement>
  extends FormComponentInnerProps {
  // TODO: note sure about this, there also seems to be label and other props that are not HTMLInput props per se
  // It may depend on the type of input as well, maybe the type is more an union
  /**
   * Input properties will contain all props that can be safely passed down to the root input
   * (often an HTML "input" or textarea)
   *
   * This includes the current "value", that can be obtained either from "props" or "props.inputProperties.value"
   * in input components
   */
  inputProperties: React.HTMLProps<TInput>;
  itemProperties: any; // TODO
}
export type FormTextAreaProps = FormInputProps<HTMLTextAreaElement>;
