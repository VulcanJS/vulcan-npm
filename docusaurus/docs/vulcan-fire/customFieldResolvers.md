---
title: "Custom field resolvers"
---

# Custom field resolvers

## What's the difference with top-level resolvers?

**Field resolvers do not really have an equivalent in a REST API, that's a benefit of GraphQL.**

There is "graph" in "GraphQL": this means that GraphQl is very good at fetching data that is linked or related to a specific document. In a blog application, you might want to fetch an Article, all the related Comments.

Field resolvers are function that can get those related data. For instance, they can get the list of Comments based on the id of your Article, or your Twitter description based on your Twitter handle, etc.

## Write a custom field resolver

### Method 1 - Assess if a relation is enough for you

First, remember that you don't need a custom field resolvers just to get related data. For instance, if you need the list of comments for an article, based on the `commentIds` field of the Article object, you can define a `relation` in your Vulcan schema.

If you are not in this scenario, you need a custom field resolver.

```ts
// Demo from Vulcan Next "sampleModel":
// we can get the "User" from an userId very easily!
  userId: {
    type: String,
    optional: true,
    canRead: ["guests"],
    // This means you can resolve the "user" field when fetching for "samples"
    relation: {
      fieldName: "user",
      kind: "hasOne",
      //typeName: "VulcanUser"
      model: User,
    },
  },
```
You can then write queries like this:
```graphql
query getSamplesWithUser {
  samples {
    # The id, stored in the database
    userId
    # This is available because you added a relation!
    user {
      _id
      email
    }
  }
}
```

Vulcan is in charge of resolving related data via its default "relation resolvers". It works for an unique id or an array of ids.


### Method 2 - Almost the same as top-level resolvers...

Field resolvers behave almost the same as [top-level resolvers](./customTopLevelResolvers.md) described earlier. So you can either create a fully custom resolver, or use a `mutator` if you must manipulate data.

You can use the `resolveAs` field of a schema to create a custom field resolver for an existing Vulcan model.


```ts
// Example from Vulcan Express:
// a fun resolver that get "itself" based on the document _id
    myselfVirtual: {
      type: String,
      canRead: ["guests"],
      canCreate: [],
      canUpdate: [],
      resolveAs: {
        fieldName: "myself",
        typeName: "Contributor",
        resolver: async (root /*: ContributorDocument*/, args, context) => {
          return await context.dataSources["Contributor"].findOneById(root._id);
        },
      },
    },
```

**/!\ You can only add custom field resolvers to server models! They should not exist client-side!**

[Vulcan Next has a complete example of this setup.](https://github.dev/VulcanJS/vulcan-next/blob/main/src/vulcan-demo/models/sampleModel.server.ts)

### Method 3 - ...but use DataSources if possible

The main difference between field resolvers and top-level resolvers is that, if possible, you should use [DataSources](https://www.apollographql.com/docs/apollo-server/data/data-sources/) for field-resolvers. DataSources will reduce the number of calls to your database in many scenarios, this is what we call the "N+1" problem.

As a default, Fire will generate [Mongo DataSources](https://github.com/GraphQLGuide/apollo-datasource-mongodb) for each model.

**Be careful with ObjectId from Mongo ddocuments!** You should convert them to string ids before responding to a GraphQL request, otherwise you may end up with unexpected issues. Vulcan Fire default relation resolvers and Mongoose connector will handle the conversion for you.

In your custom resolvers, you might need to use our `convertIdAndTransformToJSON` helper exported from `@vulcanjs/crud/server`, it works for a single document or an array of documents.
