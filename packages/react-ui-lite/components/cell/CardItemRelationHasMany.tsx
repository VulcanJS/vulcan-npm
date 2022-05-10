import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

// HasMany Relation
export const CardItemRelationHasMany = ({
  relatedDocument: relatedDocuments,
  ...rest
}: any) => {
  const Components = useVulcanComponents();
  return (
    <div className="contents-hasmany">
      {relatedDocuments.map((relatedDocument) => (
        <Components.CardItemRelationItem
          key={relatedDocument._id}
          relatedDocument={relatedDocument}
          {...rest}
        />
      ))}
    </div>
  );
};
