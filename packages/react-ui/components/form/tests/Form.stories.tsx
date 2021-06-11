import React from "react";
import { Story, Meta } from "@storybook/react";
// TODO: we have to do this otherwise we end up with a circular dep...
import { Form } from "../Form/Form";
import { FormProps } from "../Form/typings";
import { createModel } from "@vulcanjs/model";
import SimpleSchema from "simpl-schema";
import * as models from "./fixtures/models";
import { VulcanComponentsProvider } from "../VulcanComponents/Provider";

export default {
  component: Form,
  title: "Form", //TODO: why we need this?
  decorators: [
    (Story) => (
      <VulcanComponentsProvider>
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    model: createModel({
      name: "Biography",
      schema: {},
    }),
  },
  argTypes: {
    createDocument: { action: "createDocument" },
    updateDocument: { action: "updateDocument" },
    deleteDocument: { action: "deleteDocument" },
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
  // another syntax for actions
} as Meta;

const FormTemplate: Story<FormProps> = (args) => <Form {...args} />;

export const DefaultForm = FormTemplate.bind({});
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
export const EmptyForm = FormTemplate.bind({
  args: {
    model: createModel({
      name: "Biography",
      schema: {},
    }),
  },
});

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
    ...fieldSchema,
  }));

const basicTypes = [
  ["String", String],
  ["Date", Date],
  ["Boolean", Boolean],
  ["Number", Number],
  ["SimpleSchema.Integer", SimpleSchema.Integer],
];
const basicFieldsSchema = withDefaultFieldSchema(
  fromPairs([
    // native inputs
    ...basicTypes.map(([name, type]) => [name, { type }]),
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

export const OneTextInput = FormTemplate.bind({});
OneTextInput.args = {
  model: createModel({
    name: "Biography",
    schema: { someText: { ...defaultFieldSchema, type: String } },
  }),
};

export const AllBasicFields = FormTemplate.bind({});
AllBasicFields.args = {
  model: createModel({
    name: "Biography",
    schema: basicFieldsSchema,
  }),
};

// SELECT
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

export const SelectFieldsForm = FormTemplate.bind({});
SelectFieldsForm.args = {
  model: createModel({
    name: "Biography",
    schema: selectFieldsSchema,
  }),
};

// ARRAY AND OBJECTS
export const ArrayOfObjectsForm = FormTemplate.bind({});
ArrayOfObjectsForm.args = { model: models.ArrayOfObjects };
export const ObjectsForm = FormTemplate.bind({});
ObjectsForm.args = { model: models.Objects };
export const ArrayOfUrlsForm = FormTemplate.bind({});
ArrayOfUrlsForm.args = { model: models.ArrayOfUrls };
export const ArrayOfCustomObjectsForm = FormTemplate.bind({});
ArrayOfCustomObjectsForm.args = { model: models.ArrayOfCustomObjects };
export const ArrayFullCustomForm = FormTemplate.bind({});
ArrayFullCustomForm.args = { model: models.ArrayFullCustom };
// eslint-disable-next-line no-unused-vars
export const ArrayOfStringsForm = FormTemplate.bind({});
ArrayOfStringsForm.args = { model: models.ArrayOfStrings };
export const AddressesForm = FormTemplate.bind({});
AddressesForm.args = { model: models.Addresses };

// EDIT MODE
export const WithDocument = FormTemplate.bind({});
WithDocument.args = {
  model: models.OneField,
  document: { text: "hello there" },
};

// @see https://github.com/storybookjs/storybook/pull/14550
export const WarnOnUnsavedChanges = () => (
  <div>
    <p>To test: fill the form and try to leave the page</p>
    <Form
      {...(FormTemplate.args as FormProps)}
      model={createModel({
        name: "Biography",
        schema: { someText: { ...defaultFieldSchema, type: String } },
      })}
      warnUnsavedChanges={true}
    />
  </div>
);
