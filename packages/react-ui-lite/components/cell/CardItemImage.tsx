import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

/*

Card Item Components

*/

/**
 * NOTE: in Next.js you might want to replace this component with
 * the built-in image component?
 *
 * @param param0
 * @returns
 */
export const CardItemImage = ({ value, force = false }) => {
  const Components = useVulcanComponents();
  const isImage =
    [".png", ".jpg", ".gif"].indexOf(value.substr(-4)) !== -1 ||
    [".webp", ".jpeg"].indexOf(value.substr(-5)) !== -1;
  return isImage || force ? (
    <img
      className="contents-image"
      style={{ width: "100%", minWidth: 80, maxWidth: 200, display: "block" }}
      src={value}
      alt={value}
    />
  ) : (
    <Components.CardItemURL value={value} />
  );
};
