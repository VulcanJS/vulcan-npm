import React from "react";
import { useVulcanComponents } from "../VulcanComponents";

// HasMany Relation
export const CardItemRelationHasMany = ({
  relatedDocument: relatedDocuments,
  ...rest
}) => {
  const Components = useVulcanComponents();
  return (
    <div className="contents-hasmany">
      {relatedDocuments.map((relatedDocument) => (
        <Components.CardItemRelationItem
          key={relatedDocument._id}
          relatedDocument={relatedDocument}
          Components={Components}
          {...rest}
        />
      ))}
    </div>
  );
};
