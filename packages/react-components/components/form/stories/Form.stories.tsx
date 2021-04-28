import React from "react";
import { Story, Meta } from "@storybook/react";
import { Form, FormProps } from "../Form";
import { VulcanComponentsProvider } from "../VulcanComponentsContext";
import { createModel } from "@vulcanjs/model";
import { IntlProvider } from "@vulcanjs/i18n";
import { actions } from "@storybook/addon-actions";

export default {
  component: Form,
  title: "Form", //TODO: why we need this?
  argTypes: { submitCallback: { action: "clicked" } },
  decorators: [
    (Story) => (
      // TODO: improve this
      <VulcanComponentsProvider>
        <IntlProvider locale="fr">
          <Story />
        </IntlProvider>
      </VulcanComponentsProvider>
    ),
  ],
};
/*
More advanced patterns with templates 
https://storybook.js.org/docs/react/writing-stories/introduction#using-args
We'll stick to a more readable approach though to use the Stories code as usage demoes
const FormTemplate: Story<FormProps> = (args: FormProps) => (
  <Form {...args}></Form>
);
*/
/*
export const EmptyForm = FormTemplate.bind({});
EmptyForm.args = {
  model: createModel({
    name: "Biography",
    schema: {},
  }),
};
*/
const defaultProps: FormProps = {
  model: createModel({
    name: "Biography",
    schema: {},
  }),

  ...actions(
    "submitCallback",
    "successCallback",
    "errorCallback",
    "cancelCallback",
    "removeSuccessCallback",
    "changeCallback",
    // mutations
    "createDocument",
    "updateDocument",
    "deleteDocument"
  ),
};
export const EmptyForm = () => (
  <Form
    {...defaultProps}
    model={createModel({
      name: "Biography",
      schema: {},
    })}
  />
);
const allFieldsSchema = [
  { type: String },
  { type: Date },
  { type: Boolean },
  { type: Number },
  { type: String, input: "password" },
].reduce(
  (schema, fieldSchema) => ({
    ...schema,
    [`${fieldSchema.type.toString()}${fieldSchema.input ? "-input" : ""}`]: {
      ...fieldSchema,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
    },
  }),
  {}
);
export const AllBasicFieldsForm = () => (
  <Form
    {...defaultProps}
    model={createModel({
      name: "Biography",
      schema: allFieldsSchema,
    })}
  />
);
