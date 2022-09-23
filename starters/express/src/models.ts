import mongoose from "mongoose";
import {
  buildDefaultQueryResolvers,
  createGraphqlModelServer,
} from "@vulcanjs/graphql/server";
// Optional: Vulcan will do that for you already
// but here we show how you can provide your own connector if necessary
// (eg for supporting SQL)
import { createMongooseConnector } from "@vulcanjs/mongo";
import {
  createMongooseDataSource,
  MongoId,
} from "@vulcanjs/mongo-apollo/server";

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
      // Don't forget this typeName, in order to correctly handle Mongo ObjectId conversion
      typeName: MongoId,
      optional: true,
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
      //canDelete: ["guests"],
    },
    name: {
      type: String,
      optional: true,
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
      //canDelete: ["guests"],
    },
    // Virtual field that queries the contributor itself
    // This is just a dumb demo for Apollo dataSources
    myselfVirtual: {
      type: String,
      canRead: ["guests", "anyone"],
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
      if (contributorModel.crud.connector) {
        return createMongooseDataSource(
          contributorModel,
          contributorModel.crud.connector
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
    canRead: ["guests", "anyone"],
    canCreate: ["guests", "anyone"],
  },
});

export const Repository = createGraphqlModelServer({
  name: "Repository",
  schema: {
    _id: {
      type: String,
      typeName: MongoId,
      optional: true,
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
      //canDelete: ["guests"],
    },
    url: {
      type: String,
      optional: true,
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
      //canDelete: ["guests"],
    },
    contributorId: {
      type: String,
      typeName: MongoId,
      // You will be able to query the "contributor" field of any "repository" object
      relation: {
        fieldName: "contributor",
        kind: "hasOne",
        model: Contributor,
      },
      // will add a "repository" field to the contributor type
      // (without having to extend the contributor model explicitely)
      reversedRelation: {
        model: Contributor,
        kind: "hasOneReversed",
        foreignFieldName: "repository",
      },
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
    },
  },
  graphql: {
    // Automated pluralization can lead to unexpected bugs, we prefer an explicit plural name
    multiTypeName: "Repositories",
    typeName: "Repository",
  },
  permissions: {
    canRead: ["guests", "anyone"],
    canCreate: ["guests", "anyone"],
  },
});

//await mongoose.models["contributors"].deleteMany();
export const models = [Contributor, Repository];
