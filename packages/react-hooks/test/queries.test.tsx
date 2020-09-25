import React from "react";
import expect from "expect";
import { MockedProvider } from "@apollo/client/testing";
import { print } from "graphql";

//import gql from 'graphql-tag';
//import { initComponentTest } from 'meteor/vulcan:test';
import { useMulti, useSingle } from "../index";
import { buildSingleQuery } from "../single";
import { buildMultiQuery, buildMultiQueryOptions } from "../multi";
import { renderHook, act } from "@testing-library/react-hooks";

import { createModel } from "@vulcanjs/model";
import {
  extendModel as extendModelGraphql,
  VulcanGraphqlModel,
} from "@vulcanjs/graphql";

describe("react-hooks/queries", function () {
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
  /*
  const fragment = {
    definitions: [
      {
        name: {
          value: fragmentName,
        },
      },
    ],
    toString: () => `fragment FoosDefaultFragment on Foo { 
        id
        hello
        __typename
      }`,
  };*/
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
      expect(queryResult.result).toEqual(foo);
    });
    /*
    test("send new request if props are updated", async () => {
      const query = singleQuery({ typeName, fragmentName, fragment });
      const firstRequest = {
        request: {
          query,
          variables: {
            // variables must absolutely match with the emitted request,
            // including undefined values
            input: {
              selector: { documentId: undefined, slug: undefined },
              enableCache: false,
            },
          },
        },
        result: {
          data: {
            foo: { result: null, __typename: "Foo" },
          },
        },
      };
      const documentIdRequest = {
        request: {
          query,
          variables: {
            input: {
              selector: { documentId: "42", slug: undefined },
              enableCache: false,
            },
          },
        },
        result: {
          data: {
            foo: { result: foo, __typename: "Foo" },
          },
        },
      };
      const mocks = [firstRequest, documentIdRequest]; // need multiple mocks, one per query
      const SingleComponent = withSingle({
        collection: Foo,
        queryOptions: {
          pollInterval: 0, // disable polling otherwise it will fail (we need 1 mock per request)
        },
        fragment,
      })(TestComponent);
      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <SingleComponent />
        </MockedProvider>
      );
      // @see https://www.apollographql.com/docs/react/recipes/testing/#testing-final-state
      //await new Promise(resolve => setTimeout(resolve));
      await wait(0);
      wrapper.update(); // rerender
      const intermediateRes = wrapper.find(TestComponent).first();
      expect(intermediateRes.prop("loading")).toBe(false);
      expect(intermediateRes.prop("data").error).toBeFalsy();
      expect(intermediateRes.prop("document")).toEqual(null);
      // change props (MockedProvider will pass childProps down)
      wrapper.setProps({ childProps: { documentId: "42" } });
      await wait(0);
      wrapper.update();
      const finalRes = wrapper.find(TestComponent).first();
      expect(finalRes.prop("loading")).toBe(false);
      expect(finalRes.prop("data").error).toBeFalsy();
      expect(finalRes.prop("document")).toEqual(foo);
    });
    test("work if fragment is not yet defined", () => {
      const hoc = withSingle({
        collection: Foo,
        fragmentName: "NotRegisteredYetFragment",
      });
      expect(hoc).toBeDefined();
      expect(hoc).toBeInstanceOf(Function);
    });
    test("add extra queries", async () => {
      const mock = {
        request: {
          query: singleQuery({
            typeName,
            fragmentName,
            fragment,
            extraQueries: "extra { foo }",
          }),
          variables: {
            // variables must absolutely match with the emitted request,
            // including undefined values
            input: {
              selector: { documentId: undefined, slug: undefined },
              enableCache: false,
            },
          },
        },
        result: {
          data: {
            foo: { result: foo, __typename: "Foo" },
            extra: { foo: "bar", __typename: "Foo" },
          },
        },
      };
      const mocks = [mock]; // need multiple mocks, one per query
      const SingleComponent = withSingle({
        collection: Foo,
        queryOptions: {
          pollInterval: 0, // disable polling otherwise it will fail (we need 1 mock per request)
        },
        fragment,
        extraQueries: "extra { foo }",
      })(TestComponent);
      const wrapper = mount(
        <MockedProvider removeTypename mocks={mocks}>
          <SingleComponent />
        </MockedProvider>
      );
      await wait(0);
      wrapper.update(); // rerender
      const finalRes = wrapper.find(TestComponent).first();
      expect(finalRes.prop("loading")).toBe(false);
      expect(finalRes.prop("data").error).toBeFalsy();
      expect(finalRes.prop("document")).toEqual(foo);
    });
  });*/
  });
  describe("useMulti", () => {
    const defaultQuery = buildMultiQuery({
      fragment,
      typeName,
      multiTypeName,
      fragmentName,
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
      expect(queryResult.results).toEqual([foo]);
      //expect(loadingRes.prop("loading")).toEqual(true);
      //expect(loadingRes.prop("error")).toBeFalsy();
      //// pass loading
      //await wait(0);
      //wrapper.update();
      //const finalRes = wrapper.find(TestComponent);
      //expect(finalRes.prop("loading")).toEqual(false);
      //expect(finalRes.prop("error")).toBeFalsy();
      //expect(finalRes.prop("results")).toEqual([foo]);
      //expect(finalRes.prop("count")).toEqual(1);
    });

    /*
    test("load more increase the limit", async () => {
      // @see https://stackoverflow.com/questions/49064334/invoke-a-function-with-enzyme-when-function-is-passed-down-as-prop-react
      const responses = [
        // first request
        {
          request: {
            query: defaultQuery,
            variables: {
              input: {
                ...defaultVariables.input,
                terms: {
                  limit: 1,
                  itemsPerPage: 1, // = first limit
                },
              },
            },
          },
          result: {
            data: {
              foos: {
                results: [foo],
                totalCount: 10,
                __typename: "[Foo]",
              },
            },
          },
        },
        // calling loadMore / loadMoreInc will send new requests with updated terms
        // loadMore
        {
          request: {
            query: defaultQuery,
            variables: {
              input: {
                ...defaultVariables.input,
                terms: {
                  limit: 2, // limit is increased by load more
                  itemsPerPage: 1,
                },
              },
            },
          },
          result: {
            data: {
              foos: {
                results: [foo, foo, foo],
                totalCount: 10,
                __typename: "[Foo]",
              },
            },
          },
        },
      ];

      const MultiComponent = withMulti(defaultOptions)(TestComponent);

      const wrapper = mount(
        <MockedProvider mocks={responses}>
          <MultiComponent terms={{ limit: 1 }} />
        </MockedProvider>
      );
      // get data
      await wait(0);
      wrapper.update();

      // call load more
      expect(wrapper.find(TestComponent).prop("loadMore")).toBeInstanceOf(
        Function
      );
      wrapper.find(TestComponent).prop("loadMore")();
      await wait(0);
      wrapper.update();
      const loadMoreRes = wrapper.find(TestComponent);
      expect(loadMoreRes.prop("error")).toBeFalsy();
      expect(loadMoreRes.prop("results")).toHaveLength(3);
    });

    // FIXME: sometimes this test does not pass
    test.skip("loadMoreInc get more data", async () => {
      // @see https://stackoverflow.com/questions/49064334/invoke-a-function-with-enzyme-when-function-is-passed-down-as-prop-react
      const responses = [
        // first request
        {
          request: {
            query: defaultQuery,
            variables: {
              input: {
                ...defaultVariables.input,
                terms: {
                  limit: 1,
                  itemsPerPage: 1, // = first limit
                },
              },
            },
          },
          result: {
            data: {
              foos: {
                results: [foo],
                totalCount: 10,
                __typename: "[Foo]",
              },
            },
          },
        },
        // loadmoreInc
        {
          request: {
            query: defaultQuery,
            variables: {
              // get an offset to load only relevant data
              input: { terms: { limit: 1, itemsPerPage: 1, offset: 1 } },
            },
          },
          result: {
            data: {
              foos: {
                results: [foo],
                totalCount: 10,
                __typename: "[Foo]",
              },
            },
          },
        },
      ];

      const MultiComponent = withMulti(defaultOptions)(TestComponent);

      const wrapper = mount(
        <MockedProvider mocks={responses}>
          <MultiComponent terms={{ limit: 1 }} />
        </MockedProvider>
      );
      // get data
      await wait(0);
      wrapper.update();
      // call load more incremental
      // TODO: weird behaviour
      expect(wrapper.find(TestComponent).prop("loadMoreInc")).toBeInstanceOf(
        Function
      );
      wrapper.find(TestComponent).prop("loadMoreInc")();
      await wait();
      wrapper.update();
      // NOTE: this can sometimes fail for no reason... rerun the tests to debug
      if (Meteor.isServer) {
        // in the client call is instantaneous... don't know why
        const loadMoreIncLoading = wrapper.find(TestComponent);
        expect(loadMoreIncLoading.prop("loadingMore")).toBe(true);
        await wait();
        wrapper.update();
      }
      const loadMoreIncRes = wrapper.find(TestComponent);
      expect(loadMoreIncRes.prop("loadingMore")).toEqual(false);
      expect(loadMoreIncRes.prop("error")).toBeFalsy();
      expect(loadMoreIncRes.prop("results")).toHaveLength(2);
    });
    test("work if fragment is not yet defined", () => {
      const hoc = withMulti({
        collection: Foo,
        fragmentName: "NotRegisteredYetFragment",
      });
      expect(hoc).toBeDefined();
      expect(hoc).toBeInstanceOf(Function);
    });
  });

  describe("withCurrentUser", () => {
    test("return a valid component", () => {
      const CurrentUserComponent = withCurrentUser(TestComponent);
      expect(CurrentUserComponent).toBeDefined();
    });
  });
  describe("withSiteData", () => {
    test("return a valid component", () => {
      const SiteDataComponent = withSiteData(TestComponent);
      expect(SiteDataComponent).toBeDefined();
    });
    */
  });
});
