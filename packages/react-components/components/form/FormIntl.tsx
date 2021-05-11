import React, { PureComponent } from "react";
import omit from "lodash/omit";
import { PossibleFormComponents } from "./defaultVulcanComponents";

const Locales: Array<{ id: string }> = []; // ?? might need to get this from context
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
  // TODO: this should be provided by "Form" context
  getLabel: (name: string, localeId: string) => string;
}

export const FormIntl = (props: FormIntlProps) => {
  /*
  Note: ideally we'd try to make sure to return the right path no matter
  the order translations are stored in, but in practice we can't guarantee it
  so we just use the order of the Locales array.

  */
  const getLocalePath = (defaultIndex) => {
    return `${props.path}_intl.${defaultIndex}`;
  };

  const { name, FormComponents } = props;

  // do not pass FormIntl's own value, inputProperties, and intlInput props down
  const properties = omit(
    props,
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
            label={props.getLabel(name, locale.id)}
            path={getLocalePath(i)}
            locale={locale.id}
          />
        </FormComponents.FormIntlItemLayout>
      ))}
    </FormComponents.FormIntlLayout>
  );
};
