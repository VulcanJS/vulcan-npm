import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import omit from "lodash/omit";
// import getContext from "recompose/getContext";
import { PossibleFormComponents } from "./FormComponentsContext";

const Locales: Array<{ id: string }> = []; // ?? might need to get this from context
// import { Locales } from "meteor/vulcan:core";
// replaceable layout
export const FormIntlLayout = ({ children }) => (
  <div className="form-intl">{children}</div>
);
export const FormIntlItemLayout = ({ locale, children }) => (
  <div className={`form-intl-${locale.id}`}>{children}</div>
);

interface FormIntlProps {
  path: string;
  name: string;
  FormComponents: PossibleFormComponents;
  getLabel: (name: string, localeId: string) => string;
}
export class FormIntl extends PureComponent<FormIntlProps> {
  propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    FormComponents: PropTypes.object,
  };
  /*

  Note: ideally we'd try to make sure to return the right path no matter
  the order translations are stored in, but in practice we can't guarantee it
  so we just use the order of the Locales array.

  */
  getLocalePath = (defaultIndex) => {
    return `${this.props.path}_intl.${defaultIndex}`;
  };

  render() {
    const { name, FormComponents } = this.props;

    // do not pass FormIntl's own value, inputProperties, and intlInput props down
    const properties = omit(
      this.props,
      "value",
      "inputProperties",
      "intlInput",
      "nestedInput"
    );
    return (
      <FormComponents.FormIntlLayout>
        {Locales.map((locale, i) => (
          <FormComponents.FormIntlItemLayout key={locale.id} locale={locale}>
            <FormComponents.FormComponent
              {...properties}
              label={this.props.getLabel(name, locale.id)}
              path={this.getLocalePath(i)}
              locale={locale.id}
            />
          </FormComponents.FormIntlItemLayout>
        ))}
      </FormComponents.FormIntlLayout>
    );
  }
}

// TODO: what about the getContext? It seems to come from i18n?
/*
registerComponent(
  "FormIntl",
  FormIntl,
  getContext({
    getLabel: PropTypes.func,
  })
);
*/
