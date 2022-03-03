import React from "react";
import { useVulcanComponents } from "../VulcanComponents";

// HasOne Relation
export const CardItemRelationHasOne = ({ ...rest }: any) => {
  const Components = useVulcanComponents();
  return (
    <div className="contents-hasone">
      {<Components.CardItemRelationItem {...rest} />}
    </div>
  );
};
