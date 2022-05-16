# GraphQL Server + Mongo

## Vulcan Fire

🔥[Vulcan Fire](../../vulcan-fire) is our internal CRUD engine. It lets you setup the most basic operations very easy for any kind of data model.
A simple blog requires at least a dozen GraphQL resolvers: let Vulcan do the hard work!

More info in the [live learning tutorial](https://vulcan-next.vercel.app/learn) or in [Vulcan Fire docs](../../vulcan-fire).

## Apollo Server

### Demo of a simple server

See `src/pages/api/graphql` for a demo server built with Apollo and Express

**NOTE:** Expect drastic enhancement of the way the server is set up, thanks to [VulcanJS](http://vulcanjs.org/) declarative approach.

### GraphQL Playground

GraphQL Playground is available on `api/graphql`. All API routes of Next are located in the `src/pages/api` folder, hence the `api` prefix.

### Graphql Voyager

Open `api/debug/graphql-voyager` and explore your API visually.

## MongoDB

### Persistance with Mongo through Docker

As easy as ABC:

```sh
yarn start:mongo
```

It will run an ephemeral Docker instance of Mongo v4. Data are stored in your project, in the `./.mongo` folder. The container is removed when stopped, but your data are persisted and will still be available on next run.


### Lambda safe connection

Relevant docs:

[Official tutorial without mongoose](https://developer.mongodb.com/how-to/nextjs-building-modern-applications)

[Best practice for Mongo in AWS Lambda](https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/)

### Mongoose for schema-based modeling

### Conversion between GraphQL ID and Mongoose ID types

[See relevant issue](https://github.com/apollographql/apollo-server/issues/1633)