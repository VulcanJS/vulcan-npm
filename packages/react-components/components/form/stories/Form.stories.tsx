import React from "react";
import { Story, Meta } from "@storybook/react";
import { Form, FormProps } from "../Form";

const FormTemplate: Story<FormProps> = (args) => <Form {...args}></Form>;
export const CompleteForm = FormTemplate.bind({});
CompleteForm.args = {};
