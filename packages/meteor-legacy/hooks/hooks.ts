// @see packages/vulcan-users/lib/server/mutations.js
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

// TODO: those typings should be reusable for all hooks
import {
  OperationVariables,
  MutationFunctionOptions,
} from "@apollo/react-common";
import { MutationTuple, MutationHookOptions } from "@apollo/react-hooks";

import { ApolloVariables } from "@vulcan/graphql";

// We modify the result function so that variables can be provided as first param,
// which is more intuitive
// Normal mutation function type (sadly not exported directly by Apollo)
type MutationFunction<
  TData = any,
  TVariables = OperationVariables
> = MutationTuple<TData, TVariables>["0"];
type MutationResult<
  TData = any,
  TVariables = OperationVariables
> = MutationTuple<TData, TVariables>["1"];

type MutationFunctionResult<TData, TVariables> = ReturnType<
  MutationFunction<TData, TVariables>
>;
// Type of an Apollo mutation function, but that takes variables as the first param instead of digging
// through options
type EnhancedMutationFunction<TData = any, TVariables = OperationVariables> = (
  variables?: TVariables,
  options?: MutationFunctionOptions<TData, TVariables>
) => MutationFunctionResult<TData, TVariables>;
// Result of the mutatation hook, but with a modified function
type EnhancedMutationTuple<TData = any, TVariables = OperationVariables> = [
  EnhancedMutationFunction<TData, TVariables>,
  MutationResult<TData, TVariables>
];

// Mutation with a fixed query + variables as first argument of the mutation function
type PrebuiltMutation<TData = any, TVariables = OperationVariables> = (
  options?: MutationHookOptions<TData, TVariables>
) => EnhancedMutationTuple<TData, TVariables>;
// MutationTuple<TData, TVariables>;

const acceptVariablesAsFirstArg = (
  mutationFunction: MutationFunction
): EnhancedMutationFunction => {
  return (variables = {}, options) =>
    mutationFunction({ ...options, variables });
};
const enhanceUseMutationResult = <TData = any, TVariables = OperationVariables>(
  result: MutationTuple<TData, TVariables>
): EnhancedMutationTuple<TData, TVariables> => {
  const [mutationFunction, ...rest] = result;
  return [acceptVariablesAsFirstArg(mutationFunction), ...rest];
};

interface SignupInput {
  email: string;
  password: string;
}
interface SignupOutput {
  userId: string;
}
const signupMutation = gql`
  mutation signup($input: SignupInput) {
    signup(input: $input) {
      userId
    }
  }
`;
export const useSignup: PrebuiltMutation<
  { signup: SignupOutput },
  ApolloVariables<SignupInput>
> = (
  options //enhanceUseMutationResult(
) => enhanceUseMutationResult(useMutation(signupMutation, options));
//);

interface AuthWithPasswordInput {
  email: string;
  password: string;
}
interface AuthWithPasswordOutput {
  token: string;
  userId: string;
}
const authenticateWithPasswordMutation = gql`
  mutation auth($input: AuthPasswordInput) {
    authenticateWithPassword(input: $input) {
      token
      userId
    }
  }
`;
export const useAuthenticateWithPassword: PrebuiltMutation<
  { authenticateWithPassword: AuthWithPasswordOutput },
  ApolloVariables<AuthWithPasswordInput>
> = (options) =>
  enhanceUseMutationResult(
    useMutation(authenticateWithPasswordMutation, options)
  );

interface LogoutInput {}
interface LogoutOutput {
  userId: string;
}
const logoutMutation = gql`
  mutation logout {
    logout {
      userId
    }
  }
`;
export const useLogout: PrebuiltMutation<
  { logout: LogoutOutput },
  ApolloVariables<LogoutInput>
> = (options) => enhanceUseMutationResult(useMutation(logoutMutation, options));
// export const useSetPassword = () => {
//
// }
//
// export const useSendResetPasswordEmail = () => {
//
// }
//
// export const useResetPassword = () => {
//
// }
//
// export const useSendVerificationEmail = () => {
//
// }
//
// export const verifyEmail = () => {
//
// }
