import { useQuery, gql } from "@apollo/client";
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
