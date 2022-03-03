import React from "react";
import { Link } from "react-router-dom";

/*

Tokens are components used to display an invidual element like a user name, 
link to a post, category name, etc. 

The naming convention is Type+Token, e.g. UserToken, PostToken, CategoryToken…

*/

// Relation Item
export const CardItemRelationItem = ({
  relatedDocument,
  relatedCollection,
  Components,
}) => {
  const label = relatedCollection.options.getLabel
    ? relatedCollection.options.getLabel(relatedDocument)
    : relatedDocument._id;
  const typeName = relatedDocument.__typename;
  const Cell = Components[`${typeName}Cell`];
  return Cell ? (
    <Cell document={relatedDocument} label={label} Components={Components} />
  ) : (
    <Components.DefaultCell
      document={relatedDocument}
      label={label}
      Components={Components}
    />
  );
};

// Default Cell
export const DefaultCell = ({ document, label }) => (
  <li className="relation-default-cell">
    {document.pagePath ? (
      <Link to={document.pagePath}>{label}</Link>
    ) : (
      <span>{label}</span>
    )}
  </li>
);

// User Token
export const UserCell = ({ document, Components }) => (
  <div className="contents-user user-item">
    <Components.Avatar size="small" user={document} />
    {document.pagePath ? (
      <Link className="user-item-name" to={document.pagePath}>
        {document.displayName}
      </Link>
    ) : (
      <span className="user-item-name">{document.displayName}</span>
    )}
  </div>
);
