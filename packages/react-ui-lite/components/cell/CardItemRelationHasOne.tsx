import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

// HasOne Relation
export const CardItemRelationHasOne = ({ ...rest }: any) => {
  const Components = useVulcanComponents();
  return (
    <div className="contents-hasone">
      {<Components.CardItemRelationItem {...rest} />}
    </div>
  );
};
