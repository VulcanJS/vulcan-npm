import React from "react";
import { useCreate, useUpdate, useUpsert, useDelete } from "../index";
import {
  //multiQueryUpdater,
  buildCreateQuery,
} from "../create";
import { buildUpdateQuery } from "../update";
import { buildUpsertQuery } from "../upsert";
import { buildDeleteQuery } from "../delete";
import gql from "graphql-tag";
// import sinon from "sinon";
import { createModel } from "@vulcanjs/model";
import {
  VulcanGraphqlModel,
  extendModel as extendModelGraphql,
} from "@vulcanjs/graphql";
import { MockedProvider } from "@apollo/client/testing";
import { renderHook, act } from "@testing-library/react-hooks";

const test = it;

describe("react-hooks/mutations", () => {
  const typeName = "Foo";
  const multiTypeName = "Foos";
  const Foo: VulcanGraphqlModel = createModel({
    name: "Foo",
    schema: {
      id: {
        type: String,
        canRead: ["guests"],
      },
      hello: {
        type: String,
        canRead: ["guests"],
      },
    },
    extensions: [
      extendModelGraphql({
        typeName,
        multiTypeName,
      }),
    ],
  }) as VulcanGraphqlModel;
  const fragment = Foo.graphql.defaultFragment;
  const fragmentName = Foo.graphql.defaultFragmentName;
  const rawFoo = { hello: "world" };
  const foo = { _id: 1, hello: "world" };
  const fooWithTypename = { _id: 1, hello: "world", __typename: "Foo" };
  describe("exports", () => {
    test("export hooks and hocs", () => {
      expect(useCreate).toBeInstanceOf(Function);
      expect(useUpdate).toBeInstanceOf(Function);
      expect(useUpsert).toBeInstanceOf(Function);
      expect(useDelete).toBeInstanceOf(Function);
    });
  });

  describe("create", () => {
    test("run a create mutation", async () => {
      const mock = {
        request: {
          query: buildCreateQuery({ fragmentName, fragment, typeName }),
          variables: {
            input: {
              data: rawFoo,
            },
          },
        },
        result: {
          data: {
            createFoo: {
              data: fooWithTypename,
            },
          },
        },
      };
      const mocks = [mock, mock, mock];
      const wrapper = ({ children }) => (
        <MockedProvider addTypename={false} mocks={mocks}>
          {children}
        </MockedProvider>
      );

      const { result, waitForNextUpdate } = renderHook(
        () => useCreate({ model: Foo }),
        { wrapper }
      );

      const createFoo = result.current[0];
      let mutationResult = result.current[1];
      expect(mutationResult.loading).toEqual(false);
      await act(async () => {
        const createResult = await createFoo({ input: { data: rawFoo } });
        expect(createResult.data).toEqual({
          createFoo: { data: fooWithTypename },
        });
        expect(createResult.document).toEqual(fooWithTypename);
      });
    });
  });
  /*

  describe("update", () => {
    test("run update mutation", async () => {
      const UpdateComponent = withUpdate2(defaultOptions)(TestComponent);
      const responses = [
        {
          request: {
            query: buildUpdateQuery({ typeName, fragmentName, fragment }),
            variables: {
              //selector: { documentId: foo._id },
              data: fooUpdate,
              input: {},
            },
          },
          result: {
            data: {
              updateFoo: {
                data: foo,
                __typename: "Foo",
              },
            },
          },
        },
      ];
      const wrapper = mount(
        <MockedProvider mocks={responses}>
          <UpdateComponent />
        </MockedProvider>
      );
      expect(wrapper.find(TestComponent).prop("updateFoo")).toBeInstanceOf(
        Function
      );
      const res = await wrapper.find(TestComponent).prop("updateFoo")({
        data: fooUpdate,
      });
      expect(res).toEqual({
        data: { updateFoo: { data: foo, __typename: "Foo" } },
      });
    });
  });
  describe("upsert", () => {
    test("run upsert mutation", async () => {
      const UpsertComponent = withUpsert2(defaultOptions)(TestComponent);
      const responses = [
        {
          request: {
            query: buildUpsertQuery({ typeName, fragmentName, fragment }),
            variables: {
              data: fooUpdate,
              input: {},
            },
          },
          result: {
            data: {
              upsertFoo: {
                data: foo,
                __typename: "Foo",
              },
            },
          },
        },
      ];
      const wrapper = mount(
        <MockedProvider mocks={responses}>
          <UpsertComponent />
        </MockedProvider>
      );
      expect(wrapper.find(TestComponent).prop("upsertFoo")).toBeInstanceOf(
        Function
      );
      const res = await wrapper.find(TestComponent).prop("upsertFoo")({
        data: fooUpdate,
      });
      expect(res).toEqual({
        data: { upsertFoo: { data: foo, __typename: "Foo" } },
      });
    });
  });
  describe("delete", () => {
    test("run delete mutations", async () => {
      const DeleteComponent = withDelete2(defaultOptions)(TestComponent);
      const responses = [
        {
          request: {
            query: buildDeleteQuery({ typeName, fragment, fragmentName }),
            variables: {
              input: {
                _id: "42",
              },
            },
          },
          result: {
            data: {
              deleteFoo: {
                data: foo,
                __typename: "Foo",
              },
            },
          },
        },
      ];
      const wrapper = mount(
        <MockedProvider mocks={responses}>
          <DeleteComponent />
        </MockedProvider>
      );
      expect(wrapper.find(TestComponent).prop("deleteFoo")).toBeInstanceOf(
        Function
      );
      const res = await wrapper.find(TestComponent).prop("deleteFoo")({
        input: {
          _id: "42",
        },
      });
      expect(res).toEqual({
        data: { deleteFoo: { data: foo, __typename: "Foo" } },
      });
    });
  });

  describe("custom mutation", () => {
    test("return a component even if fragment is not yet registered", () => {
      const MutationComponent = withMutation({
        name: "whatever",
        fragmentName: "foobar",
      })(TestComponent);
      expect(MutationComponent).toBeInstanceOf(Function);
    });
  });

*/
});
