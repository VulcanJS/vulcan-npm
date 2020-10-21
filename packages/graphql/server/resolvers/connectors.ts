/**
 * We expect the connectors to be already in the context
 *
 * This function is just an helper to retrieve it
 * @param context
 * @param model
 */

import { VulcanModel } from "@vulcanjs/model";
import { Connector } from "./typings";

export const getModelConnector = (context, model: VulcanModel): Connector => {
  return context[model.name].connector;
};
