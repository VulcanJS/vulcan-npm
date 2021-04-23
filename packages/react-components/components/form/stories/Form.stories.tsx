import React from "react";
import { Story, Meta } from "@storybook/react";
import { Form, FormProps } from "../Form";
import { VulcanComponentsProvider } from "../VulcanComponentsContext";
import { createModel } from "@vulcanjs/model";
import { IntlProvider } from "@vulcanjs/i18n";

export default {
  component: Form,
  title: "Form", //TODO: why we need this?
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
const FormTemplate: Story<FormProps> = (args: FormProps) => (
  <Form {...args}></Form>
);
export const EmptyForm = FormTemplate.bind({});
EmptyForm.args = {
  model: createModel({
    name: "Biography",
    schema: {},
  }),
};
export const OneFieldForm = FormTemplate.bind({});
OneFieldForm.args = {
  model: createModel({
    name: "Biography",
    schema: {
      id: {
        type: String,
        canRead: ["guests"],
        canCreate: ["guests"],
        canUpdate: ["guests"],
      },
    },
  }),
};
