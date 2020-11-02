import { createModel } from "@vulcanjs/model";
import extendModel from "../../extendModel";
import { getModel, getModelConnector } from "../resolvers/context";

describe("graphql/context", () => {
  test("get model from context using the GraphQL typeName", () => {
    const model = createModel({
      schema: {},
      name: "Banana", // the typeName should be used here, the model name can differ though it's not recommended
      extensions: [extendModel({ typeName: "Foo", multiTypeName: "Foos" })],
    });
    const context = {
      Foo: {
        model,
        connector: "connector",
      },
    };
    expect(getModel(context, "Foo")).toEqual(model);
    expect(getModelConnector(context, getModel(context, "Foo"))).toEqual(
      "connector"
    );
  });
});
