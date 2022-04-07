import { gql } from "graphql-tag";
import mongoose from "mongoose";
import { Contributor, Repository } from "./models";

export const seedDemoDb = async () => {
  // insert some dummy data just for testing
  console.log("Seeding...");
  /**
   * NOTE: calling the mongoose model directly WON'T run
   * the model callbacks.
   *
   * You may instead want to use a "mutator"
   */
  const contributorMongooseModel = mongoose.models[Contributor.name];
  await contributorMongooseModel.deleteMany({});
  const contributor = await contributorMongooseModel.create({
    name: "John Doe",
  });
  console.log("Done seeding db with 1 contributor");
  const repoMongooseModel = mongoose.models[Repository.name];
  await repoMongooseModel.deleteMany({});
  await repoMongooseModel.create({
    url: "https://github.com/VulcanJS/vulcan-npm",
    contributorId: contributor._id,
  });
  console.log("Done seeding db with 1 repository");
};

/**
 * Some demonstration queries you can run in Apollo Studio after the seed
 */
const demoContributorsQuery = gql`
  query contribs {
    contributors {
      results {
        name
        myself {
          name
        }
      }
    }
  }
`;

const demoRepositoriesQuery = gql`
  query repos {
    repositories {
      results {
        url
        # get some related data
        contributor {
          name
          myself {
            name
          }
        }
      }
    }
  }
`;
