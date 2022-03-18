## Difference with @vulcanjs/graphql and @vulcanjs/mongo

The graphql and mongo packages should not have inter-dependencies.

This 3rd package contains code that depends on both crud/graphql and mongo,
like dataSources for mongo, or mongo connectors.


This package is server-only!