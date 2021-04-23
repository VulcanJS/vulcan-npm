import React from "react";
import { Story, Meta } from "@storybook/react";
import { Form, FormProps } from "../Form";
import { VulcanComponentsProvider } from "../VulcanComponentsContext";

export default {
  component: Form,
  decorators: [
    (Story) => (
      // TODO: improve this
      <VulcanComponentsProvider>
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
};
const FormTemplate: Story<FormProps> = (args) => <Form {...args}></Form>;
export const CompleteForm = FormTemplate.bind({});
CompleteForm.args = {};
