import { makeAutocomplete } from "../autocomplete";

test("run makeAutocomplete on real life example - people", () => {
  const projectAutoComplete = makeAutocomplete(
    {
      suffix: "prenormalized",
      type: Array,
      arrayItem: {
        type: String,
        optional: true,
      },
    },
    {
      autocompletePropertyName: "name",
      queryResolverName: "projects",
      fragmentName: "ProjectFragment",
      valuePropertyName: "id",
    }
  );
  expect(projectAutoComplete).toBeDefined();
});
test("run makeAutocomplete on real life example - project", () => {
  const peopleAutocomplete = makeAutocomplete(
    {
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
      autocompletePropertyName: "name", // overridden by field definition above
      queryResolverName: "entities", // overridden by field definition above
      fragmentName: "EntityFragment", // overridden by field definition above
      valuePropertyName: "id", // overridden by field definition above
    }
  );
  expect(peopleAutocomplete).toBeDefined();
});
