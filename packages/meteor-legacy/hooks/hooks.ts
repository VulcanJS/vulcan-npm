// @see packages/vulcan-users/lib/server/mutations.js
import {
  useMutation,
  MutationTuple,
  MutationHookOptions,
  MutationFunctionOptions,
  OperationVariables,
  gql,
} from "@apollo/client";

import { ApolloVariables } from "@vulcanjs/graphql";

// We modify the result function so that variables can be provided as first param,
// which is more intuitive
// Normal mutation function type (sadly not exported directly by Apollo)
type MutationFunction<TData = any, TVariables = OperationVariables> =
  MutationTuple<TData, TVariables>["0"];
type MutationResult<TData = any, TVariables = OperationVariables> =
  MutationTuple<TData, TVariables>["1"];

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
/**
 * Transform mutation callbacks so they accept arguments as the first response
 * @param result
 */
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

interface SetPasswordInput {
  newPassword: string;
}
interface AuthResult {
  token: string;
  userId: string;
}
interface SetPasswordOutput extends AuthResult {}
const setPasswordMutation = gql`
  mutation setPassword($input: SetPasswordInput) {
    setPassword(input: $input) {
      token
      userId
    }
  }
`;
/**
 * Update the password (for an authenticated user)
 * @param options
 */
export const useSetPassword: PrebuiltMutation<
  { setPassword: SetPasswordOutput },
  ApolloVariables<SetPasswordInput>
> = (options) =>
  enhanceUseMutationResult(useMutation(setPasswordMutation, options));

interface AuthEmailInput {
  email: string;
}
interface SendResetPasswordEmailInput extends AuthEmailInput {}
type SendResetPasswordEmailOutput = boolean;

const sendResetPasswordEmail = gql`
  mutation sendResetPasswordEmailEmail($input: AuthEmailInput) {
    sendResetPasswordEmail(input: $input)
  }
`;
/**
 * Trigger the reset password email
 */
export const useSendResetPasswordEmail: PrebuiltMutation<
  { sendResetPasswordEmail: SendResetPasswordEmailOutput },
  ApolloVariables<SendResetPasswordEmailInput>
> = () => enhanceUseMutationResult(useMutation(sendResetPasswordEmail));

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
interface ResetPasswordOutput {
  userId: string;
}
const resetPasswordMutation = gql`
  mutation resetPassword($input: ResetPasswordInput) {
    resetPassword(input: $input) {
      userId
    }
  }
`;
/**
 * Change the password using a "forgotten password" token sent by mail
 */
export const useResetPassword: PrebuiltMutation<
  { resetPassword: ResetPasswordOutput },
  ApolloVariables<ResetPasswordInput>
> = () => enhanceUseMutationResult(useMutation(resetPasswordMutation));

interface SendVerificationEmailInput extends AuthEmailInput {}
type SendVerificationEmailOutput = boolean;

const sendVerificationEmailMutation = gql`
  mutation sendVerificationEmail($input: AuthEmailInput) {
    sendVerificationEmail(input: $input)
  }
`;

/**
 * Send again the verification email if necessary
 */
export const useSendVerificationEmail: PrebuiltMutation<
  { sendVerificationEmail: SendVerificationEmailOutput },
  ApolloVariables<SendVerificationEmailInput>
> = () => enhanceUseMutationResult(useMutation(sendVerificationEmailMutation));

interface VerifyEmailInput {
  token: string;
}
interface VerifyEmailOutput {
  userId: string;
}

const verifyEmailMutation = gql`
  mutation verifyEmail($input: VerifyEmailInput) {
    verifyEmail(input: $input) {
      userId
    }
  }
`;
export const verifyEmail: PrebuiltMutation<
  { verifyEmail: VerifyEmailOutput },
  ApolloVariables<VerifyEmailInput>
> = () => enhanceUseMutationResult(useMutation(verifyEmailMutation));
