import React from "react";
import expect from "expect";
import { MockedProvider } from "@apollo/client/testing";
// import { print } from "graphql";

//import gql from 'graphql-tag';
//import { initComponentTest } from 'meteor/vulcan:test';
import { useMulti, useSingle } from "../index";
import { buildSingleQuery } from "../single";
import { buildMultiQuery, buildMultiQueryOptions } from "../multi";
import { renderHook, act } from "@testing-library/react-hooks";

import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import { createGraphqlModel } from "@vulcanjs/graphql/extendModel";

describe("react-hooks/queries", function () {
  const typeName = "Foo";
  const multiTypeName = "Foos";
  const Foo: VulcanGraphqlModel = createGraphqlModel({
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
    graphql: {
      typeName,
      multiTypeName,
    },
  });

  const fragment = Foo.graphql.defaultFragment;
  const fragmentName = Foo.graphql.defaultFragmentName;
  const foo = { id: "1", hello: "world" };
  const fooWithTypename = { ...foo, __typename: "Foo" };

  describe("exports", () => {
    test("export hooks", () => {
      expect(useSingle).toBeDefined();
      expect(useMulti).toBeDefined();
    });
  });

  describe("useSingle", () => {
    test("query a single document", async () => {
      const mock = {
        request: {
          query: buildSingleQuery({ typeName, fragmentName, fragment }),
          variables: {
            // variables must absolutely match with the emitted request,
            // including undefined values
            input: {
              id: foo.id,
              allowNull: false,
              enableCache: false,
            },
          },
        },
        result: {
          data: {
            foo: { result: fooWithTypename }, // we need __typename otherwise result is empty
          },
        },
      };

      const mocks = [mock]; // need multiple mocks, one per query
      const wrapper = ({ children }) => (
        <MockedProvider addTypename={false} mocks={mocks}>
          {children}
        </MockedProvider>
      );
      const { result, waitForNextUpdate } = renderHook(
        () =>
          useSingle({
            model: Foo,
            input: {
              id: foo.id,
            },
          }),
        { wrapper }
      );

      let queryResult = result.current;
      expect(queryResult.loading).toEqual(true);
      // @see https://www.apollographql.com/docs/react/recipes/testing/#testing-final-state
      // @see https://react-hooks-testing-library.com/reference/api#waitfornextupdate
      // Needed for async hook that may update their state at any moment, like useQuery
      // This will remove the "act" warning even if we don't test anything afterward
      await waitForNextUpdate();
      queryResult = result.current;
      expect(queryResult.loading).toEqual(false);
      expect(queryResult.data).toEqual({
        foo: { result: foo },
      });
      // 'result' is a custom property, so that we can access relevant data without digging queries
      expect(queryResult.document).toEqual(foo);
    });
  });
  describe("useMulti", () => {
    const defaultQuery = buildMultiQuery({
      model: Foo,
    });
    const defaultVariables = buildMultiQueryOptions({ input: {} }, {}, {})
      .variables;

    test("query multiple documents", async () => {
      const totalCount = 10;
      const mock = {
        request: {
          query: defaultQuery,
          variables: defaultVariables,
        },
        result: {
          data: {
            foos: {
              results: [fooWithTypename],
              totalCount,
            },
          },
        },
      };
      const mocks = [mock];
      const wrapper = ({ children }) => (
        <MockedProvider addTypename={false} mocks={mocks}>
          {children}
        </MockedProvider>
      );

      const { result, waitForNextUpdate } = renderHook(
        () =>
          useMulti({
            model: Foo,
            input: {},
          }),
        { wrapper }
      );
      let queryResult = result.current;
      expect(queryResult.loading).toEqual(true);
      await waitForNextUpdate();
      queryResult = result.current;
      expect(queryResult.loading).toEqual(false);
      expect(queryResult.data).toEqual({
        foos: {
          results: [foo],
          totalCount,
        },
      });
      // shortcut
      expect(queryResult.documents).toEqual([foo]);
    });

    // FIXME: sometimes this test does not pass
    test("loadMore get more data", async () => {
      const totalCount = 10;
      // @see https://stackoverflow.com/questions/49064334/invoke-a-function-with-enzyme-when-function-is-passed-down-as-prop-react
      const mocks = [
        // first request
        {
          request: {
            query: defaultQuery,
            variables: {
              ...defaultVariables,
              input: {
                ...defaultVariables.input,
                limit: 1,
              },
            },
          },
          result: {
            data: {
              foos: {
                results: [fooWithTypename],
                totalCount: 10,
              },
            },
          },
        },
        // loadmore
        {
          request: {
            query: defaultQuery,
            variables: {
              // get an offset to load only relevant data
              input: { limit: 1, offset: 1 },
            },
          },
          result: {
            data: {
              foos: {
                results: [fooWithTypename],
                totalCount: 10,
              },
            },
          },
        },
        // no more data
        {
          request: {
            query: defaultQuery,
            variables: {
              // get an offset to load only relevant data
              input: { limit: 1, offset: 2 },
            },
          },
          result: {
            data: {
              foos: {
                results: [],
                totalCount: 10,
              },
            },
          },
        },
      ];
      const wrapper = ({ children }) => (
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      );

      const { result, waitForNextUpdate } = renderHook(
        () =>
          useMulti({
            model: Foo,
            input: { limit: 1 },
          }),
        { wrapper }
      );
      let queryResult = result.current;
      expect(queryResult.loading).toEqual(true);
      await waitForNextUpdate();
      queryResult = result.current;
      expect(queryResult.loading).toEqual(false);
      // 2nd request to get more data
      expect(queryResult.loadMore).toBeInstanceOf(Function);
      await act(async () => {
        await queryResult.loadMore();
      });
      queryResult = result.current;
      expect(queryResult.data).toEqual({
        foos: {
          results: [fooWithTypename, fooWithTypename],
          totalCount,
        },
      });
      // await waitForNextUpdate();
      expect(queryResult.documents).toEqual([fooWithTypename, fooWithTypename]);
      // 3rd request (no more data)
      await act(async () => {
        await queryResult.loadMore();
      });
      queryResult = result.current;
      expect(queryResult.data).toEqual({
        foos: {
          results: [fooWithTypename, fooWithTypename],
          totalCount,
        },
      });
      // await waitForNextUpdate();
      expect(queryResult.documents).toEqual([fooWithTypename, fooWithTypename]);
    });
  });
});
