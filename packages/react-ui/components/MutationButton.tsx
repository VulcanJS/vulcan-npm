/*

Example Usage

<Components.MutationButton
  label="Cancel Subscription"
  variant="primary"
  mutationOptions={{
    name: 'cancelSubscription',
    args: { bookingId: 'String' },
    fragmentName: 'BookingsStripeDataFragment',
  }}
  mutationArguments={{ bookingId: booking._id }}
  submitCallback={() => {}}
  successCallback={result => { console.log(result) }}
/>

*/
import React, { useState } from "react";
import { DocumentNode } from "graphql";
import { gql, MutationHookOptions, useMutation } from "@apollo/client";
import { useVulcanComponents } from "./VulcanComponents";
// import withMutation from '../containers/registeredMutation';

// TODO:
/**
 * Difference with Vulcan Meteor: there is no
 * registered mutation anymore,
 * so you need to pass your mutations explicitely, using graphql
 */
/*
export class MutationButton extends PureComponent {
  constructor(props) {
    super(props);
    this.button = withMutation(props.mutationOptions)(MutationButtonInner);
  }

  render() {
    const Component = this.button;
    return <Component {...this.props} />;
  }
}*/

export interface MutationButtonProps {
  /** @deprected Pass the mutation directly instead */
  mutationOptions: never;
  /**
   * @example
    mutation: gql`
      mutation sampleMutation($input: Input) {
        hello
      }
    `,
   */
  mutation: string | DocumentNode;
  /** Variables passed to the mutation (NOTE: we can't pass other options at the moment) */
  mutationArguments: MutationHookOptions<any>["variables"];
  submitCallback: () => void | Promise<void>;
  successCallback: (res: any) => void | Promise<void>;
  errorCallback: (err: any) => void | Promise<void>;
  // Now isolated into their own object to avoid needed to explicitely pick/omit
  loadingButtonProps: {
    label: string;
  };
}
export const MutationButton = (props: MutationButtonProps) => {
  const Components = useVulcanComponents();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | undefined>();

  const {
    //mutationOptions,
    mutation,
    mutationArguments,
    loadingButtonProps,
  } = props;
  const mutationAsNode =
    typeof mutation === "string"
      ? gql`
          ${mutation}
        `
      : mutation;
  const [mutationFunc] = useMutation(mutationAsNode, {
    variables: mutationArguments,
  });

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const {
      //mutationOptions,
      submitCallback,
      successCallback,
      errorCallback,
    } = props;
    //const mutationName = mutationOptions.name;
    //const mutation = this.props[mutationName];

    try {
      if (submitCallback) {
        await submitCallback();
      }
      const result = await mutationFunc();
      if (successCallback) {
        await successCallback(result);
      }
    } catch (error) {
      setError(error);
      if (errorCallback) {
        await errorCallback(error);
      }
    } finally {
      setLoading(false);
    }

    // mutation(mutationArguments)
    //   .then(result => {
    //     this.setState({ loading: false });
    //     if (successCallback) {
    //       successCallback(result);
    //     }
    //   })
    //   .catch(error => {
    //     this.setState({ loading: false });
    //     if (errorCallback) {
    //       errorCallback(error);
    //     }
    //   });
  };

  //const mutationName = this.props.mutationOptions.name;

  const loadingButton = (
    <Components.LoadingButton
      loading={loading}
      onClick={handleClick}
      {...loadingButtonProps}
    />
  );

  if (error) {
    return (
      <Components.TooltipTrigger trigger={loadingButton} defaultShow={true}>
        {error.message.replace("GraphQL error: ", "")}
      </Components.TooltipTrigger>
    );
  }
  return loadingButton;
};
