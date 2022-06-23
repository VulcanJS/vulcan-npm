# Mongo

## Handle ObjectId

### I prefer ObjectID _id (default)

This is the default behaviour of Vulcan Next as we strive to stay consistent with the broader Mongo ecosystem.

If you don't want to deal with ObjectID, see next section to use normal string ids instead.

- Setup the `GraphqlObjectId` scalar.

This scalar automatically handles the conversion back and forth between string (needed client-side) and
ObjectID (server-side).

Vulcan Next already does it for you in the `api/graphql` API route.

- Use `GraphqlObjectId` as the `typeName` for every unique identifier in your schemas.

Server to client: this is not strictly needed when queriying document, because ObjectId will serialize to String anyway.
Client to server: this is needed when filtering or when mutating document, the scalar will convert the string back to an `ObjectId`,
which is necessary for your search queries or your mutations to work correctly

**If you encounter issues with filtering**, you might have forgotten to add this `typeName`.

Example:
```js
import { GraphqlObjectId } from "@vulcanjs/mongo-apollo"
...
  schema: {
    _id: {
      type: String,
      // This tells GraphQL to convert your _id to an ObjectId server-side
      // (and do the opposite client-side)
      typeName: GraphqlObjectId,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
    },
    userId: {
      type: String,
      typeName: GraphqlObjectId,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
    },
    contributorId: {
      type: String,
      typeName: GraphqlObjectId,
      // You will be able to query the "contributor" field of any "repository" object
      relation: {
        fieldName: "contributor",
        kind: "hasOne",
        model: Contributor,
      },
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
    },
  },
```

### I prefer string _id (Meteor-style)


- Remember to always generate the _id by hand if you create a document outside of Vulcan!

To avoid using ObjectId, you simply need to define a string _id yourself on document creation.

#### When using a connector

Pass the `useStringId: true` option when creating your connector.



#### When using a custom script

```js
import { ObjectId } from "mongodb"

_id: ObjectId().toString()
```
  
We currently have no way to configure the MongoDB Node driver to use string _id systematically.
You have to manually generate a string _id on document creation.

## Use another database than Mongo

You can define custom connectors in Vulcan. See how `@vulcanjs/mongo` is implemented.