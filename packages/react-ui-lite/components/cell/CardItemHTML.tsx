import React from "react";

// HTML
export const CardItemHTML = ({ value }) => (
  <div className="contents-html" dangerouslySetInnerHTML={{ __html: value }} />
);
