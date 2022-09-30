import React from "react";
import { Story, Meta } from "@storybook/react";
// TODO: we have to do this otherwise we end up with a circular dep...
import {
  defaultCoreComponents,
  defaultFormComponents,
  Form,
  FormProps,
} from "@vulcanjs/react-ui";
import { createModel } from "@vulcanjs/model";
import * as models from "./fixtures/models";
import {
  defaultFieldSchema,
  basicFieldsSchema,
  withDefaultFieldSchema,
} from "./fixtures/schemas";
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";
import { action } from "@storybook/addon-actions";
import { liteCoreComponents } from "../../VulcanComponents/liteVulcanComponents/coreComponents";
import { liteFormComponents } from "../../VulcanComponents/liteVulcanComponents/formComponents";

export default {
  component: Form,
  title: "react-ui-lite/Form",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider
        value={{
          ...defaultCoreComponents,
          ...defaultFormComponents,
          ...liteCoreComponents,
          ...liteFormComponents,
        }}
      >
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    model: createModel({
      name: "Biography",
      schema: {},
    }),
    createDocument: (variables) => {
      action("createDocument");
      return Promise.resolve({ document: variables.input.data, errors: [] });
    },
    updateDocument: (variables) => {
      action("updateDocument");
      return Promise.resolve({ document: variables.input.data, errors: [] });
    },
  },
  argTypes: {
    // createDocument: { action: "createDocument" },
    // updateDocument: { action: "updateDocument" },
    deleteDocument: { action: "deleteDocument" },
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
  // another syntax for actions
} as Meta<FormProps>;

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

export const OneTextInput = FormTemplate.bind({});
OneTextInput.args = {
  model: createModel({
    name: "Biography",
    schema: { someText: { ...defaultFieldSchema, type: String } },
  }),
};

export const I18nField = FormTemplate.bind({});
I18nField.args = {
  model: createModel({
    name: "Biography",
    schema: {
      someText: {
        ...defaultFieldSchema,
        type: String,
        intlId: "field_token",
        intl: true,
      },
    },
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
  // using select at the moment
  "string-radiogroup": {
    type: String,
    input: "radiogroup",
    options: [
      { label: "a", value: "a" },
      { label: "b", value: "b" },
      { label: "c", value: "c" },
    ],
  },
});

export const SelectFieldsForm = FormTemplate.bind({});
SelectFieldsForm.args = {
  model: createModel({
    name: "Biography",
    schema: selectFieldsSchema,
  }),
};

const selectMultipleFieldsSchema = withDefaultFieldSchema({
  // multiple
  "string-checkboxgroup": {
    type: String,
    input: "checkboxgroup",
    options: [
      { label: "a", value: "a" },
      { label: "b", value: "b" },
      { label: "c", value: "c" },
    ],
  },
  "string-select-multiple": {
    type: String,
    input: "selectmultiple",
    options: [
      { label: "a", value: "a" },
      { label: "b", value: "b" },
      { label: "c", value: "c" },
    ],
  },
  /* 
  // TODO:
  multiautocomplete
  */
});
export const SelectMultipleFieldsForm = FormTemplate.bind({});
SelectMultipleFieldsForm.args = {
  model: createModel({
    name: "Biography",
    schema: selectMultipleFieldsSchema,
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

export const OverrideFormItemContext = () => (
  <VulcanComponentsProvider value={{ FormItem: () => "FORM ITEM REPLACED" }}>
    <Form
      {...(FormTemplate.args as FormProps)}
      model={createModel({
        name: "Biography",
        schema: { someText: { ...defaultFieldSchema, type: String } },
      })}
    />
  </VulcanComponentsProvider>
);
