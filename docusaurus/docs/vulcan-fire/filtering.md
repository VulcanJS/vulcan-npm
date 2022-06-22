---
title: Filtering
---

When loading data, you will usually want to apply some kind of filtering or sorting to your query. Vulcan offers the following tools to help you get the data you need, whether you need to select a single document or a range of items. 

#### Database vs GraphQL Fields

Note that all sorting, filtering, etc. operations happen at the database level. So in all following examples, you can only filter and sort by **database** fields, not GraphQL-only fields. 

## Query Arguments

The following arguments are available for both single-document and multi-documents queries. 

### Filter

Vulcan queries and mutations take a `filter` argument to help you target one or more specific documents.

The `filter` argument can either accept a list of fields; or special `_and`, `_not`, and `_or` operators used to combine multiple `filter` selectors. 

Each field can then in turn receive an operator such as `_eq` or `_in` depending on its type. Note that this API was heavily inspired by the [Hasura](https://hasura.io/docs/latest/graphql/core/databases/postgres/queries/query-filters/) API. 

Here is an example `MovieFilterInput` input type:

```gql
input MovieFilterInput {
  _and: [MovieFilterInput]
  _not: MovieFilterInput
  _or: [MovieFilterInput]
  _id: String_Selector
  createdAt: Date_Selector
  userId: String_Selector
  slug: String_Selector
  title: String_Selector
}
```

And here is an example query using `filter`: 

```gql
query MyMovie {
  movie(input: { filter: { _id: { _eq: "123foo" } } }) {
    result{
      _id
      title
      year
    }
  }
}
```

You can use the `filter` argument to query for single documents, but if the filter matches more than one document only the first one will be returned. 

#### With Mongo

Available filters are visible in your GraphQL schema. You can search for any type ending in `_Selector`: `String_Selector`, `Float_Selector`...

Most parameters have transparent meaning: `_eq`, `_lt`, `_lte`, `_gt`, `_gte`, `_in` (for an array of values) etc.

The `_like` filter for strings will be translated as a case insensitive [`$regex`](https://www.mongodb.com/docs/manual/reference/operator/query/regex/) call.

```ts
// Conversion table from Vulcan filters to Mongo selectors
  _is_null: (value) => ({ $exists: !value }),
  _is: (value) => ({ $elemMatch: { $eq: value } }),
  _contains: (value) => ({ $elemMatch: { $eq: value } }),
  _like: (value) => ({
    $regex: value,
    $options: "i",
  }),
```

If you use `ObjectId` for document ids instead of strings, the `GraphqlObjectId_Selector` will be used. 
It supports basic operations: `_eq`, `_in`, `_is_null`, `_neq`.

#### With other databases

The `_filter` function of each database connector translates Vulcan filters into a format that your database can understand. 
We only support Mongo out-of-the-box, but you can use it as an example to support more databases, SQL or No-SQL.

#### Custom Filters

There are also cases where your query is too complex to be able to define it through the GraphQL API. For example, you could imagine a scenario where you have `Movies` and `Reviews` rating them on a five-star scale, and want to filter movies to only show those with a specific rating average.

In this case, you would define a server-side `_withRating` filter (starting with an underscore is a convention to differentiate the filter from field names), and then reference it in your query:

```
query MoviesWithRating {
  movies(input: { filter: { _withRating: { average: 4 } } }) {
    results{
      _id
      title
      year
      description
    }
  }
}
```

The filter function takes an argument object with the query `input` and `context` as properties; and should return an object with `selector` and `options` properties. Here's how you would define it:

```ts
const Movies = createGraphqlModelServer({
  name: 'Movies',

  graphql: {
    typeName: 'Movie',
    schema,
  }

  crud: {
    customFilters: [
    {
      name: '_withRating',
      arguments: 'average: Int',
      filter: ({ input, context, filterArguments }) => {
        const { average } = filterArguments;
        const { Reviews } = context;
        // get all movies that have an average review score of X stars 
        const xStarReviewsMoviesIds = getMoviesByScore(average);
        return {
          selector: { _id: {$in: xStarReviewsMoviesIds } },
          options: {}
        }
      };
    }
  ]
  },
});
```

##### Custom Filters & Nested Fields

Custom filters can be useful to work around the limitations of the filtering system. For example, unlike MongoDB the GraphQL filtering API does not let you filter based on nested document fields (e.g. `addresses.country`) since every filter needs to be defined in the GraphQL schema. But you can define a custom filter instead: 

```js
customFilters: [
  {
    name: '_withAddressCountry',
    arguments: 'country: String',
    filter: ({ input, context, filterArguments }) => {
      const { country } = filterArguments;
      return {
        selector: { 'addresses.country': country },
        options: {},
      };
    },
  },
],
```

### Sort

```graphql
query RecentMovies {
  movies(input: { filter: { year: { gte: "2010" } }, sort: { year: "desc" } }) {
    results{
      _id
      title
      year
    }
  }
}
```

#### Custom Sorts

Custom sorts are not yet implemented, but you can modify the `options` property returned by a custom filter to achieve the same effect. 

### Search

In some cases you'll want to select data based on a field value, but without knowing exactly which field to search in. While you can build a complex query that lists every field needing to be searched, Vulcan also offers a shortcut in the form of the `search` argument: 

```gql
query FightMovies {
  movies(input: { search: "fight" ) {
    results{
      _id
      title
      year
      description
    }
  }
}
```

On the server, Vulcan will search any field marked as `searchable: true` in its collection's schema for the string `fight` and will return the result. 

## Single-Document Queries Arguments

The following arguments are only available for single-document queries.

### ID

Sometimes you already know the ID of the specific document you want to select. In those cases, you can use the `id` argument:

```gql
query myMovie {
  movie(input: { id: "123foo" }) {
    result{
      _id
      title
      year
    }
  }
}
```

## Multi Document Queries Arguments

The following arguments are only available for multi-document queries.


### Limit

```gql
query RecentMovies {
  movies(input: { filter: { year: { gte: 2010" } }, sort: { year: "desc" }, limit: 10 }) {
    results{
      _id
      title
      year
    }
  }
}
```

### Offset

```gql
query NextPageOfMovies {
  movies(input: { offset: 10, limit: 10 }) {
    results{
      _id
      title
      year
    }
  }
}
```