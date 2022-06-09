import { VulcanSelector } from "@vulcanjs/crud";
import { createModel } from "@vulcanjs/model";
import { filterFunction } from "../mongoParams";

describe("vulcan:lib/mongoParams", () => {
  test("keep multiple filters", async () => {
    const filter: VulcanSelector<any> = {
      _id: { _gte: 1, _lte: 5 },
    };
    const input = {
      filter,
    };
    const model = createModel({
      name: "Foo",
      schema: { _id: { type: String, canRead: ["admins"] } },
    });
    const expectedFilter = { _id: { $gte: 1, $lte: 5 } };
    const mongoParams = await filterFunction(model, input);
    expect(mongoParams.selector).toEqual(expectedFilter);
  });
  describe("boolean operators", () => {
    const model = createModel({
      name: "Foo",
      schema: {
        _id: {
          type: String,
          canRead: ["admins"],
        },
        name: {
          type: String,
          canRead: ["admins"],
        },
        length: {
          type: Number,
          canRead: ["admins"],
        },
      },
    });
    test("handle _and at root", async () => {
      const filter: VulcanSelector<{ name: string; length: number }> = {
        _and: [{ name: { _gte: "A" } }, { length: { _lte: 2 } }],
      };
      const filter2: VulcanSelector = { _and: [] };
      const input = {
        filter,
      };
      const expectedFilter = {
        $and: [{ name: { $gte: "A" } }, { length: { $lte: 2 } }],
      };
      const mongoParams = await filterFunction(model, input);
      expect(mongoParams.selector).toEqual(expectedFilter);
    });
  });
});

const Foo = createModel({
  name: "Foo",
  schema: {
    _id: {
      type: String,
      canRead: ["anyone"],
    },
    name: {
      type: String,
      canRead: ["anyone"],
    },
    length: {
      type: Number,
      canRead: ["anyone"],
    },
  },
});
test("sort", async () => {
  const mongoParams = await filterFunction(Foo, { sort: { name: "asc" } });
  expect(mongoParams.options.sort).toEqual({ name: 1 });
  const mongoParamsDesc = await filterFunction(Foo, { sort: { name: "desc" } });
  expect(mongoParamsDesc.options.sort).toEqual({ name: -1 });
});
