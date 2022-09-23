---
title: Migrate
---

# Migration steps and significant changes for each version

## To version > v0.6.9

- ObjectId are now correctly supported, see [the new Vulcan Fire doc about Mongo](https://vulcan-docs.vercel.app/docs/vulcan-fire/mongo)
- The "useStringId" option will force Mongoose to prefer string ids

## To version > v0.6.1

- "guests" permission group should become "anyone". We have also introduced "visitors".
Visitors: will exclude connected members. Anyone: literally anyone.
Guests was not clear enough whether it included members or not so we deprecate it.
- VulcanComponents context will no longer include default components
  as a default:

  - If you use heavy components like Datatable or SmartForm only
    on certain page, you might want to load them only where appropriate.
  - You can safely nest `VulcanComponentsProvider` accross the app,
    components are merged from root to leaf. You may override existing components or define new one lower in the tree where appropriate.

- i18n React components are now located in the separate package `@vulcanjs/react-i18n`
- "connectors" are now defined in the "crud.connector" field
- mutators are now reusable without requiring a full-fledged graphql context, instead simply pass the current user.
  Ensure model callbacks are not using "context" to get other models but instead imports them explicitely
- mutators hook name is now the model "name" and not graphql "typeName" (since mutators do not depend on graphql)
- Mutators are exported from `@vulcanjs/crud/server` instead of graphql
- `@vulcanjs/graphql` no longer exports server code, use `@vulcanjs/graphql/server` where relevant

## From Vulcan Meteor legacy version

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
