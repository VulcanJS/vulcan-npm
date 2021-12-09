import React from "react";
import { Story, Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screen, userEvent } from "@storybook/testing-library";

import {
  createGraphqlModel,
  fieldDynamicQueryName,
  autocompleteQueryName,
} from "@vulcanjs/graphql";
import { makeAutocomplete } from "../autocomplete";
import { Form, FormProps } from "../../components/form";
import {
  GraphqlQueryStub,
  graphqlQueryStubsToMsw,
} from "@vulcanjs/graphql/testing";
import { VulcanComponentsProvider } from "../../components/VulcanComponents";

const people = createGraphqlModel({
  name: "People",
  graphql: {
    typeName: "People",
    multiTypeName: "Peoples",
  },
  schema: {},
});
const project = createGraphqlModel({
  name: "Project",
  graphql: {
    typeName: "Project",
    multiTypeName: "Projects",
  },
  schema: {},
});

const perms = {
  canRead: ["guests"],
  canCreate: ["guests"],
};
const autocompleteModel = createGraphqlModel({
  name: "AutocompleteModel",
  graphql: {
    typeName: "Autocomplete",
    multiTypeName: "Autocompletes",
  },
  schema: {
    project: makeAutocomplete(
      // the field
      {
        ...perms,
        suffix: "prenormalized",
        type: Array,
        arrayItem: {
          type: String,
          optional: true,
        },
      },
      // the decorator options

      {
        autocompletePropertyName: "name",
        queryResolverName: "projects",
        fragmentName: "ProjectFragment",
        valuePropertyName: "id",
      }
    ),
    people: makeAutocomplete(
      {
        ...perms,
        suffix: "prenormalized",
        type: Array,
        arrayItem: {
          type: String,
          optional: true,
        },
        options: (props) => {
          return props?.data?.entities.map((document) => ({
            ...document,
            value: document.id,
            label: document.name,
          }));
        },
        query: () => /* GraphQL */ `
          query FormComponentDynamicEntityQuery($value: [String!]) {
            entities(id: { _in: $value }) {
              id
              name
            }
          }
        `,
        autocompleteQuery: () => /* GraphQL */ `
          query AutocompletePeopleQuery($queryString: String) {
            entities(tags: ["people"], name: { _like: $queryString }) {
              id
              name
            }
          }
        `,
      },
      {
        // TODO: we will probably need to update those params
        autocompletePropertyName: "name", // overridden by field definition above
        queryResolverName: "entities", // overridden by field definition above
        fragmentName: "EntityFragment", // overridden by field definition above
        valuePropertyName: "id", // overridden by field definition above
      }
    ),
  },
});

//import { AutocompleteDemo, AutocompleteDemoProps } from '../AutocompleteDemo'
interface AutocompleteDemoProps extends FormProps {}
const AutocompleteDemo = (props: AutocompleteDemoProps) => {
  // TODO: create a model + smart form with autcomplete feature
  return <Form {...props} />;
};
export default {
  component: AutocompleteDemo,
  title: "AutocompleteDemo",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider>
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
  //args: {},
  //parameters: { actions: { argTypesRegex: "^.*Callback$" } },
  // Form props
  args: {
    model: autocompleteModel,
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
  //} as Meta<FormProps>;
} as Meta<AutocompleteDemoProps>;

const AutocompleteDemoTemplate: Story<AutocompleteDemoProps> = (args) => (
  <AutocompleteDemo {...args} />
);
export const DefaultAutocompleteDemo = AutocompleteDemoTemplate.bind({});

const peopleAutocompleteQuery: GraphqlQueryStub = {
  operationName: autocompleteQueryName({ queryResolverName: "Peoples" }),
  response: {
    data: {
      peoples: {
        results: [],
      },
    },
  },
};
/*
const peopleDynamicValueQuery: GraphqlQueryStub = {
  operationName: fieldDynamicQueryName({ queryResolverName: "Peoples" }),
  response: {
    data: {},
  },
};
*/

// TODO: what's the type of this stub? It's the result of a multi query
const projectAutocompleteQuery: GraphqlQueryStub = {
  operationName: autocompleteQueryName({ queryResolverName: "Projects" }),
  response: {
    data: {
      projects: {
        results: [{ name: "Vulcan Next", _id: "42" }],
      },
    },
  },
};
const queryMocks = graphqlQueryStubsToMsw([
  peopleAutocompleteQuery,
  projectAutocompleteQuery,
]);
export const PlayAutocompleteDemo = AutocompleteDemoTemplate.bind({});
PlayAutocompleteDemo.play = async () => {
  const projectInput = screen.getByLabelText("Project");
  await userEvent.type(projectInput, "Vulcan Next");
  /*
  People is a tad trickier because it seems to depend on another Entity model in state of js
  const peopleInput = screen.getByLabelText("People");
  await userEvent.type(peopleInput, "Octocat");
  */
};
PlayAutocompleteDemo.parameters = {
  msw: {
    handlers: [...queryMocks],
  },
};
