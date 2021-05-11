import React from "react";
import { Story, Meta } from "@storybook/react";
import { Form, FormProps } from "../Form";
import { VulcanComponentsProvider } from "../VulcanComponentsContext";
import { createModel } from "@vulcanjs/model";
import { IntlProvider, LegacyIntlProvider } from "@vulcanjs/i18n";
import { actions } from "@storybook/addon-actions";
import SimpleSchema from "simpl-schema";

export default {
  component: Form,
  title: "Form", //TODO: why we need this?
  argTypes: { submitCallback: { action: "clicked" } },
  decorators: [
    (Story) => (
      // TODO: improve this
      <VulcanComponentsProvider>
        <LegacyIntlProvider locale="fr">
          <IntlProvider locale="fr">
            <Story />
          </IntlProvider>
        </LegacyIntlProvider>
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
const defaultFieldSchema = {
  type: String,
  canRead: ["guests"],
  canCreate: ["guests"],
  canUpdate: ["guests"],
};
import fromPairs from "lodash/fromPairs";
import mapValues from "lodash/mapValues";
const withDefaultFieldSchema = (partialSchema) =>
  mapValues(partialSchema, (fieldSchema) => ({
    ...defaultFieldSchema,
    label: `${fieldSchema.type}${
      fieldSchema.input ? "-" + fieldSchema.input : ""
    }`,
    ...fieldSchema,
  }));

const basicTypes = [String, Date, Boolean, Number, SimpleSchema.Integer];
const basicFieldsSchema = withDefaultFieldSchema(
  fromPairs([
    // native inputs
    ...basicTypes.map((type) => [type.toString(), { type }]),
    ...["password", "url", "email", "textarea", "statictext"].map((input) => {
      const fieldName = `string-${input}`;
      return [
        fieldName,
        {
          type: String,
          input,
        },
      ];
    }),
    ["date-datetime", { type: Date, input: "datetime" }],
    ["date-date", { type: Date, input: "date" }],
    ["date-time", { type: Date, input: "time" }],
    /*
  TODO:
  likert: {},
  */
  ])
);
export const AllBasicFieldsForm = () => (
  <Form
    {...defaultProps}
    model={createModel({
      name: "Biography",
      schema: basicFieldsSchema,
    })}
  />
);

const selectFieldsSchema = withDefaultFieldSchema({
  "boolean-select": {
    type: Boolean,
    input: "select",
    options: [
      { label: "true", value: true },
      { label: "false", value: false },
    ],
  },
  "string-select": {
    type: String,
    input: "select",
    options: [
      { label: "a", value: "a" },
      { label: "b", value: "b" },
      { label: "c", value: "c" },
    ],
  },
  "number-select": {
    type: Number,
    input: "select",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ],
  },
  "date-select": {
    type: Date,
    input: "select",
    options: [{ label: "now", value: new Date() }],
  },
  /* 
  // TODO:
  checkboxgroup: {},
  radiogroup: {},
  select,
  selectmultiple,
  autocomplete,
  multiautocomplete
  */
});

export const SelectFieldsForm = () => (
  <Form
    {...defaultProps}
    model={createModel({
      name: "Biography",
      schema: selectFieldsSchema,
    })}
  />
);
