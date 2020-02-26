// TODO: reintroduce Vulcan fragment system when its ready
//import { getFragment } from 'meteor/vulcan:lib';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

// NOTE: this needs to be a function to avoid fragment registration issue at build time
//const buildCurrentUserQuery = () => gql`
//      query getCurrentUser {
//        currentUser {
//          ...UsersCurrent
//        }
//      }
//      ${/*getFragment('UsersCurrent')*/}
//    `;

export const useCurrentUser = () => (
    useQuery(
        gql`
        currentUser {
            _id
        }
        `
    )
    //        buildCurrentUserQuery()
);