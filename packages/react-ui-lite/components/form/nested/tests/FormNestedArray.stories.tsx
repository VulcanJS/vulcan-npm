import React from "react";
import { Story, Meta } from "@storybook/react";
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";
import { IntlProvider } from "@vulcanjs/react-i18n";
import { makeStringsRegistry } from "@vulcanjs/i18n";
import { action, actions } from "@storybook/addon-actions";
import {
  FormNestedArray,
  FormNestedArrayProps,
} from "../FormNestedArray";
import { FormContext } from "@vulcanjs/react-ui";

// TODO: instead, compose with Form stories
const defaultFormProps = {
  changeCallback: () => { },
  createDocument: () => { },
  updateDocument: () => { },
  deleteDocument: () => { },
};
export default {
  component: FormNestedArray,
  title: "FormNestedArray", //TODO: why we need this?
  decorators: [
    (Story) => (
      // TODO: improve this
      <VulcanComponentsProvider>
        <IntlProvider
          stringsRegistry={makeStringsRegistry()}
          locale="fr"
          messages={[]}
        >
          {/** NOTE: if you want to force a "currentValues", you need to wrap the component
           * with a new FormContext directly at the story level */}
          <FormContext.Provider
            // @ts-ignore
            value={{
              errors: [],
              updateCurrentValues: action("updateCurrentValue"),
            }}
          >
            <Story />
          </FormContext.Provider>
        </IntlProvider>
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    // default props
    itemProperties: {},
    label: "array",
  },
  argTypes: {},
  parameters: { actions: {} },
  // another syntax for actions
} as Meta;

const FormNestedArrayTemplate: Story<FormNestedArrayProps> = (args) => (
  <FormNestedArray {...args} />
);

export const DefaultFormNestedArray = FormNestedArrayTemplate.bind({});
DefaultFormNestedArray.args = {};
