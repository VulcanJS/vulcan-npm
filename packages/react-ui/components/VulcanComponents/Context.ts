import React from "react";
import type { PossibleVulcanComponents } from "./typings";
import { Dummy } from "./Dummy";

const dummyHandler = {
  get(target, property) {
    if (property in target) {
      return target[property];
    }
    return Dummy;
  },
};
// We need this to shut TypeScript up
// You should use the Provider to get the right default values
export const VulcanComponentsContext =
  React.createContext<PossibleVulcanComponents>(
    // @ts-ignore
    new Proxy({
      __not_intialized: true,
      dummyHandler,
    })
  );
