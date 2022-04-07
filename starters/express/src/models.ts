import mongoose from "mongoose";
import {
  buildDefaultQueryResolvers,
  createGraphqlModelServer,
} from "@vulcanjs/graphql/server";
// Optional: Vulcan will do that for you already
// but here we show how you can provide your own connector if necessary
// (eg for supporting SQL)
import { createMongooseConnector } from "@vulcanjs/mongo";
import { createMongooseDataSource } from "@vulcanjs/mongo-apollo";

/**
 * Demo model
 * 
}
 */
export const Contributor = createGraphqlModelServer({
  name: "Contributor",
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    name: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    // Virtual field that queries the contributor itself
    // This is just a dumb demo for Apollo dataSources
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
  },
  graphql: {
    typeName: "Contributor",
    multiTypeName: "Contributors",
    queryResolvers: buildDefaultQueryResolvers({
      typeName: "Contributor",
    }),
    // Optionnaly, pass a connector
    // /!\ This just an example, necessary if you want to support SQL.
    // You can remove this field if you use Mongo
    createConnector: (contributorModel) =>
      createMongooseConnector(contributorModel, {
        // Passing an instance is only needed in local development or if you have multiple mongoose connections
        // Otherwise the default export of "mongoose" is always the default connection
        mongooseInstance: mongoose,
      }),

    // Generate a data source for you
    // /!\ This just an example, necessary if you want to support SQL.
    // You can remove this field if you use Mongo
    makeCreateDataSource: (contributorModel) => () => {
      if (contributorModel.graphql.connector) {
        return createMongooseDataSource(
          contributorModel,
          contributorModel.graphql.connector
        );
      } else {
        console.warn(
          "Model",
          contributorModel.name,
          "had no connector, cannot create Apollo data source automatically."
        );
      }
    },
  },
  permissions: {
    canRead: ["guests"],
    canCreate: ["guests"],
  },
});

export const Repository = createGraphqlModelServer({
  name: "Repository",
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    url: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    contributorId: {
      type: String,
      // You will be able to query the "contributor" field of any "repository" object
      relation: {
        fieldName: "contributor",
        kind: "hasOne",
        model: Contributor,
        typeName: "Contributor",
      },
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
    },
  },
  graphql: {
    // Automated pluralization can lead to unexpected bugs, we prefer an explicit plural name
    multiTypeName: "Repositories",
    typeName: "Repository",
  },
  permissions: {
    canRead: ["guests"],
    canCreate: ["guests"],
  },
});

//await mongoose.models["contributors"].deleteMany();
export const models = [Contributor, Repository];
