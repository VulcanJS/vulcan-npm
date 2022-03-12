// @see https://stackoverflow.com/questions/70615613/apollo-client-named-export-remove-not-found
// get gql from graphql-tag directly works with ESM
import { useQuery } from "@apollo/client";
import { gql } from "graphql-tag";
import get from "lodash/get.js";

import { currentUserFragment } from "../models/user";

// NOTE: this needs to be a function to avoid fragment registration issue at build time
export const buildCurrentUserQuery = ({ currentUserFragment }) => gql`
  query getCurrentUser {
    currentUser {
      ...UsersCurrent
    }
  }
  ${currentUserFragment}
`;

export const useCurrentUser = () => {
  const result = useQuery(buildCurrentUserQuery({ currentUserFragment }));
  return {
    ...result,
    currentUser: get(result, "data.currentUser"),
  };
};
