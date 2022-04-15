---
title: Outside GraphQL
---
# Reuse Artemis logic in an Express endpoint

Artemis core logic doesn't really depend on GraphQL. 

`mutator` functions are actually reusable in any Express application in a few easy steps.

In an Express middleware:

- Generate the `context`. This is the same context that is used in GraphQL resolvers. This concept is less common outside of the GraphQL ecosystem, but still perfectly relevant.
- Generate `dataSources` as well
- Then you can use a `mutator` as you would do when creating a custom resolver, and pass it the `context` and `dataSources`.