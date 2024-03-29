import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

// Array
export const CardItemArray = ({
  nestingLevel,
  value,
}: {
  nestingLevel?: number;
  value: any;
}) => {
  const Components = useVulcanComponents();
  return (
    <ol className="contents-array">
      {value.map((item, index) => (
        <li key={index}>
          {
            <Components.CardItem
              value={item}
              typeName={typeof item}
              nestingLevel={nestingLevel}
            />
          }
        </li>
      ))}
    </ol>
  );
};
