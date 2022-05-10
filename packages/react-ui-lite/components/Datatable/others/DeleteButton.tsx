import type { VulcanGraphqlModel } from "@vulcanjs/graphql";

import { VulcanUser } from "@vulcanjs/permissions";
import { useDelete } from "@vulcanjs/react-hooks";
import { DocumentNode } from "graphql";
import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

export const DeleteButton = (props: {
  label?: string;
  fragment?: DocumentNode;
  documentId?: string;
  mutationOptions?: any;
  currentUser?: VulcanUser;
  model: VulcanGraphqlModel;
}) => {
  const Components = useVulcanComponents();
  const {
    label,
    fragment,
    documentId,
    mutationOptions,
    currentUser,
    model,
    ...rest
  } = props;
  const [deleteFunction, { loading }] = useDelete({
    model,
    fragment,
    mutationOptions,
  });

  return (
    <Components.LoadingButton
      loading={loading}
      onClick={() => {
        deleteFunction({ input: { id: documentId } });
      }}
      label={
        label || (
          <Components.FormattedMessage
            id="datatable.delete"
            defaultMessage="Delete"
          />
        )
      }
      {...rest}
    />
  );
};
