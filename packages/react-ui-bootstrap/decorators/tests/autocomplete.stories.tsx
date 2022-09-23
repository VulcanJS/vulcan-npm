import React from "react";
import { Story, Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screen, userEvent } from "@storybook/testing-library";
import { makeAutocomplete } from "@vulcanjs/graphql";

import {
  createGraphqlModel,
  fieldDynamicQueryName,
  autocompleteQueryName,
} from "@vulcanjs/graphql";
import { Form, FormProps } from "@vulcanjs/react-ui";
import {
  GraphqlQueryStub,
  graphqlQueryStubsToMsw,
} from "@vulcanjs/graphql/testing";
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";
import { bootstrapCoreComponents, bootstrapFormComponents } from "../../components/VulcanComponents/index"
import { liteCoreComponents, liteFormComponents } from "@vulcanjs/react-ui-lite";


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
        // TODO: People or Peoples?
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
interface AutocompleteDemoProps extends FormProps { }
const AutocompleteDemo = (props: AutocompleteDemoProps) => {
  // TODO: create a model + smart form with autcomplete feature
  return <Form {...props} />;
};
export default {
  component: AutocompleteDemo,
  title: "react-ui-bootstrap/AutocompleteDemo",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider
        value={{
          ...liteCoreComponents,
          ...liteFormComponents,
          ...bootstrapFormComponents,
          ...bootstrapCoreComponents
        }}
      >
        {/** Hacky solution to get styling, until Storybook
         * can load a config per package
         */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossOrigin="anonymous"
        />
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


// Error case
const projectErrorAutocompleteQuery: GraphqlQueryStub = {
  operationName: autocompleteQueryName({ queryResolverName: "Projects" }),
  response: {
    data: {},
    errors: [{ message: "Expected error during query, should display nicely" }]
  }
}
export const PlayErrorAutocompleteDemo = AutocompleteDemoTemplate.bind({});
PlayErrorAutocompleteDemo.play = async () => {
  const projectInput = screen.getByLabelText("Project");
  await userEvent.type(projectInput, "Vulcan Next");
};
PlayErrorAutocompleteDemo.parameters = {
  msw: {
    handlers: [...graphqlQueryStubsToMsw([projectErrorAutocompleteQuery])],
  },
};
