---
title: Outside GraphQL
---
# Reuse Artemis logic in an Express endpoint

Artemis core logic doesn't really depend on GraphQL. 

`mutator` functions are actually reusable in any Express application in a few easy steps.
They are exposed by the `@vulcanjs/crud/server` package.

In an Express middleware:

- Call `createMutator`, `updateMutator` or `deleteMutator` (check API docs for their full).
You'll need to pass the `currentUser`. If there is no current user, for instance if you use a mutator
in a seed script, instead use the `asAdmin` option and the `validate` option.

You can optionnaly pass the GraphQL context to a mutator, though it should not be needed anymore:

- Optionnaly generate the `context`. This is the same context that is used in GraphQL resolvers. This concept is less common outside of the GraphQL ecosystem, but still perfectly relevant.
- Generate `dataSources` as well
- Then you can use a `mutator` as you would do when creating a custom resolver, and pass it the `context` and `dataSources`.