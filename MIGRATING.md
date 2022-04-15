# Migration steps and significant changes for each version

## To version > v0.6.1

- i18n React components are now located in the separate package `@vulcanjs/react-i18n`

## From Vulcan Meteor

### No need to call new SimpleSchema() for nested field

- Remove calls to `new SimpleSchema()` for nested fields.
  Example of now valid schema with nesting:

```js
const schema = {
  withNested: {
    // this is considered a nested field
    type: {
      foo: {
        type: String,
      },
    },
  },
};
```

If you specifically need a blackbox JSON, add to your field schema:

- `typeName: "JSON"` (recommended)
- OR `blackbox: true` (NOTE: this will also remove some checks during validation)
- OR `type: Object` (NOTE: thus you don't have a schema for your objectin your schema field).

Example:

```js
const schema = {
  withNested: {
    // this is NOT considered a nested field by graphql
    type: {
      foo: {
        type: String,
      },
    },
    typeName: "JSON",
  },
};
```

## Connector API change

Update connectors to match the new API

## Mutators

`createMutator` is now returning the created object and not just the \_id
