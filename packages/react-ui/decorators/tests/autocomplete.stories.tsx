import React from "react";
import { Story, Meta } from "@storybook/react";

//import { AutocompleteDemo, AutocompleteDemoProps } from '../AutocompleteDemo'
interface AutocompleteDemoProps {}
const AutocompleteDemo = (props: AutocompleteDemoProps) => {
  // TODO: create a model + smart form with autcomplete feature
  return <>"TODO"</>;
};
export default {
  component: AutocompleteDemo,
  title: "AutocompleteDemo",
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  args: {},
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<AutocompleteDemoProps>;

const AutocompleteDemoTemplate: Story<AutocompleteDemoProps> = (args) => (
  <AutocompleteDemo {...args} />
);
export const DefaultAutocompleteDemo = AutocompleteDemoTemplate.bind({});
