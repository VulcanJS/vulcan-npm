import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import _some from "lodash/some";
import { User, isAdmin } from "@vulcanjs/permissions";
import { FieldGroup } from "@vulcanjs/schema";
import { FormField } from "./typings";
import { VulcanComponentsContext } from "./VulcanComponentsContext";

export interface FormGroupProps {
  name: string;
  label: string;
  // TODO: check if already defined or create a typings.ts to share this component
  // NOTE: make distinction between the group definition, and the extended version of Form
  group: FieldGroup /*{
    adminsOnly?: boolean;
    beforeComponent?: any;
  };*/;
  fields: Array<FormField>;
  errors: Array<any>;
  hidden?: boolean | Function;
  disabled?: boolean;
  document: any;
  currentUser?: User;
  itemProperties: any;
  // TODO: get those from Form context instead
  throwError: any;
  currentValues: any;
  updateCurrentValues: any;
  deletedValues: any;
  addToDeletedValues: any;
  clearFieldErrors: any;
  formType: any;
  prefilledProps: any;
  submitForm: any;
}
interface FormGroupState {
  collapsed: boolean;
}
class FormGroup extends PureComponent<FormGroupProps, FormGroupState> {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.renderHeading = this.renderHeading.bind(this);
    this.state = {
      collapsed: props.group.startCollapsed || false,
    };
  }

  propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    order: PropTypes.number,
    hidden: PropTypes.func,
    fields: PropTypes.array.isRequired,
    group: PropTypes.object.isRequired,
    errors: PropTypes.array.isRequired,
    throwError: PropTypes.func.isRequired,
    currentValues: PropTypes.object.isRequired,
    updateCurrentValues: PropTypes.func.isRequired,
    deletedValues: PropTypes.array.isRequired,
    addToDeletedValues: PropTypes.func.isRequired,
    clearFieldErrors: PropTypes.func.isRequired,
    formType: PropTypes.string.isRequired,
    currentUser: PropTypes.object,
    prefilledProps: PropTypes.object,
  };

  static contextType = VulcanComponentsContext; // TODO: switch to functional component

  toggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  renderHeading(FormComponents) {
    return (
      <FormComponents.FormGroupHeader
        toggle={this.toggle}
        label={this.props.label}
        collapsed={this.state.collapsed}
        hidden={this.isHidden()}
        group={this.props.group}
      />
    );
  }

  // if at least one of the fields in the group has an error, the group as a whole has an error
  hasErrors = () =>
    _some(this.props.fields, (field) => {
      return !!this.props.errors.filter((error) => error.path === field.path)
        .length;
    });

  isHidden = () => {
    const { hidden, document } = this.props;
    const isHidden =
      typeof hidden === "function"
        ? hidden({ ...this.props, document })
        : hidden || false;
    return isHidden;
  };

  render() {
    if (this.props.group.adminsOnly && !isAdmin(this.props.currentUser)) {
      return null;
    }

    const FormComponents = this.context;
    const { name, fields, label, group, document } = this.props;
    const { collapsed } = this.state;

    const anchorName = name.split(".").length > 1 ? name.split(".")[1] : name;

    return (
      <FormComponents.FormGroupLayout
        label={label}
        anchorName={anchorName}
        toggle={this.toggle}
        collapsed={collapsed}
        hidden={this.isHidden()}
        group={group}
        heading={name === "default" ? null : this.renderHeading(FormComponents)}
        hasErrors={this.hasErrors()}
        document={document}
      >
        {<group.beforeComponent {...this.props} />}

        {fields.map((field) => (
          <FormComponents.FormComponent
            key={field.name}
            disabled={this.props.disabled}
            {...field}
            document={document}
            itemProperties={{
              ...this.props.itemProperties,
              ...field.itemProperties,
            }}
            errors={this.props.errors}
            throwError={this.props.throwError}
            currentValues={this.props.currentValues}
            updateCurrentValues={this.props.updateCurrentValues}
            deletedValues={this.props.deletedValues}
            addToDeletedValues={this.props.addToDeletedValues}
            clearFieldErrors={this.props.clearFieldErrors}
            formType={this.props.formType}
            currentUser={this.props.currentUser}
            prefilledProps={this.props.prefilledProps}
            submitForm={this.props.submitForm}
            formComponents={FormComponents}
          />
        ))}

        {<group.afterComponent {...this.props} />}
      </FormComponents.FormGroupLayout>
    );
  }
}

export default FormGroup;
