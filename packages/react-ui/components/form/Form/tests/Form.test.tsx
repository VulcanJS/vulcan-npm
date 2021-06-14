import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
// @see https://storybook.js.org/addons/@storybook/react-testing
import { composeStories } from "@storybook/testing-react";
import * as stories from "./Form.stories"; // import all stories from the stories file
import {
  Addresses,
  ArrayOfObjects,
  Objects,
  ArrayOfUrls,
  ArrayFullCustom,
  ArrayOfCustomObjects,
  addressSchema,
  OneField,
} from "../../tests/fixtures/models";
import { create } from "underscore";
// Every component that is returned maps 1:1 with the stories,
// but they already contain all decorators from story level, meta level and global level.
// => here the form comes with default I18n context and default components to simplify the setup
const { DefaultForm, ArrayOfUrlsForm, ArrayOfObjectsForm } =
  composeStories(stories);

// we must import all the other components, so that "registerComponent" is called

// helpers
// tests
describe("vulcan-forms/Form", function () {
  // since some props are now handled by HOC we need to provide them manually
  // TODO : delete this one
  /*
  const defaultProps: Pick<FormProps, "changeCallback"> = {
    changeCallback: jest.fn(),
  };
  */

  describe("Form generation", function () {
    // getters
    const getArrayFormGroup = (wrapper) =>
      wrapper.find("FormGroup").find({ name: "addresses" });
    const getFields = (arrayFormGroup) => arrayFormGroup.prop("fields");
    describe("basic collection - no nesting", function () {
      it("renders", function () {
        const { container } = render(<DefaultForm model={Addresses} />);
        expect(container).toBeDefined();
      });
    });
    describe("nested object (not in array)", function () {
      it("shallow render", () => {
        const { container } = render(<DefaultForm model={Objects} />);
        expect(container).toBeDefined();
      });
      it.skip("define one field", () => {
        /*
        TODO: rewrite using testing-react
        const { container, findByRole } = render(
          <DefaultForm model={Objects} />
        );
        const defaultGroup = findByRole("group").first();
        const fields = defaultGroup.prop("fields");
        expect(fields).toHaveLength(1); // addresses field
        */
      });

      // TODO: rewrite using testing-react
      const getFormFields = (wrapper) => {
        const defaultGroup = wrapper.find("FormGroup").first();
        const fields = defaultGroup.prop("fields");
        return fields;
      };
      // TODO: rewrite using testing-react
      const getFirstField = () => {
        const wrapper = render(<DefaultForm model={Objects} />);
        const fields = getFormFields(wrapper);
        return fields[0];
      };
      it.skip("define the nestedSchema", () => {
        /*
        const addressField = getFirstField();
        expect(addressField.nestedSchema.street).toBeDefined();
        */
      });
    });
    describe("array of objects", function () {
      it("renders", () => {
        const { container } = render(<ArrayOfObjectsForm />);
        expect(container).toBeDefined();
      });
      it.skip("render a FormGroup for addresses", () => {
        const { container, getByRole } = render(<ArrayOfObjectsForm />);
        const group = getByRole("group");
        expect(group).toEqual("hello");
        /*
        const wrapper = render(
          <DefaultForm model={ArrayOfObjects} />
        );
        const formGroup = wrapper.find("FormGroup").find({ name: "addresses" });
        expect(formGroup).toBeDefined();
        expect(formGroup).toHaveLength(1);
        */
      });
      it.skip("passes down the array child fields", function () {
        /* TODO: update to testing-react
        const wrapper = render(
          <DefaultForm model={ArrayOfObjects} />
        );
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.nestedInput).toBe(true);
        expect(arrayField.nestedFields).toHaveLength(
          Object.keys(addressSchema).length
        );*/
      });
      it.skip("uses prefilled props for the whole array", () => {
        /*
        const prefilledProps = {
          addresses: [
            {
              street: "Rue de la paix",
            },
          ],
        };
        const wrapper = render(
          <DefaultForm
            model={ArrayOfObjects}
            prefilledProps={prefilledProps}
          />
        );
        const input = wrapper.find("input");
        expect(input).toHaveLength(1);
        expect(input.prop("value")).toEqual("Rue de la paix");
        */
      });
      it.skip("passes down prefilled props to objects nested in array", () => {
        /*
        const prefilledProps = {
          "addresses.$": {
            street: "Rue de la paix",
          },
        };
        const wrapper = render(
          <DefaultForm
            model={ArrayOfObjects}
            prefilledProps={prefilledProps}
          />
        );
        // press the add button
        wrapper.find("button.form-nested-add").first().simulate("click");
        const input = wrapper.find("input");
        expect(input.prop("value")).toEqual("Rue de la paix");
        */
      });
      it.skip("combine prefilled prop for array and for array item", () => {
        /*
        const prefilledProps = {
          addresses: [
            {
              street: "first",
            },
          ],
          "addresses.$": {
            street: "second",
          },
        };
        const wrapper = render(
          <DefaultForm
            model={ArrayOfObjects}
            prefilledProps={prefilledProps}
          />
        );
        // first input matches the array default value
        const input1 = wrapper.find("input").at(0);
        expect(input1.prop("value")).toEqual("first");
        // newly created input matches the child default value
        wrapper.find("button.form-nested-add").simulate("click"); // 1st button = deletion, 2nd button = add
        expect(wrapper.find("input")).toHaveLength(2);
        const input2 = wrapper.find("input").at(1); // second input
        expect(input2.prop("value")).toEqual("second");
        */
      });
    });
    describe("array with custom children inputs (e.g array of url)", function () {
      it.skip("shallow render", function () {
        /*
        const { container } = render(<ArrayOfUrlsForm />);
        expect(container).toBeDefined();
        */
      });
      it.skip("passes down the array item custom input", () => {
        /* TODO: update to testing-react
        const wrapper = render(<DefaultForm model={ArrayOfUrls} />);
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
        */
      });
    });
    describe("array of objects with custom children inputs", function () {
      it.skip("render", function () {
        /* TODO update to testing-react 
        const { container } = render(
          <DefaultForm model={ArrayOfCustomObjects} />
        );
        expect(container).toBeDefined();
        */
      });
      // TODO: does not work, schema_utils needs an update
      it.skip("passes down the custom input", function () {
        const wrapper = render(<DefaultForm model={ArrayOfCustomObjects} />);
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
      });
    });
    describe("array with a fully custom input (array itself and children)", function () {
      it.skip("shallow render", function () {
        const wrapper = render(<DefaultForm model={ArrayFullCustom} />);
        expect(wrapper).toBeDefined();
      });
      it.skip("passes down the custom input", function () {
        const wrapper = render(<DefaultForm model={ArrayFullCustom} />);
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
      });
    });
  });

  describe("Form submission", function () {
    test("create a new empty document", async () => {
      // @see https://stackoverflow.com/a/41939921/5513532 keep the "args" there for correct typing
      let createPromise = Promise.resolve({
        document: {},
        errors: [],
      });
      const createDocument = jest.fn((args) => createPromise);
      const { getByRole } = render(
        // @ts-ignore
        <DefaultForm model={OneField} createDocument={createDocument} />
      );
      const submitButton = getByRole("button", { name: /submit/i });
      submitButton.click();
      // @see https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
      // When using a promise, you need to wait for it to be done in the "act"
      await act(() => {
        // it could be improved by checking visual state (does the form show success message etc.)
        return createPromise;
      });
      expect(createDocument).toHaveBeenCalledTimes(1);
      expect(createDocument.mock.calls[0][0]).toEqual({ input: { data: {} } });
    });
  });

  describe("Form state management", function () {
    // TODO: modern approach with hooks, is exporting the hook that manage state and testing it independently
    // TODO: the change callback is triggerd but `foo` becomes null instead of "bar
    /*
    // so it's added to the deletedValues and not changedValues
    it.skip("store typed value", function () {
      const wrapper = render(
        <DefaultForm model={Foos} />
      );
      //console.log(wrapper.state());
      wrapper
        .find("input")
        .first()
        .simulate("change", { target: { value: "bar" } });
      // eslint-disable-next-line no-console
      console.log(wrapper.find("input").first().html());
      // eslint-disable-next-line no-console
      console.log(wrapper.state());
      expect(wrapper.state().currentValues).toEqual({ foo: "bar" });
    });
    */
    /*
    it("reset state when relevant props change", function () {
      const wrapper = render(
        <DefaultForm model="Foos" collection={Foos} />
      );
      wrapper.setState({ currentValues: { foo: "bar" } });
      expect(wrapper.state("currentValues")).toEqual({ foo: "bar" });
      wrapper.setProps({ collectionName: "Bars" });
      expect(wrapper.state("currentValues")).toEqual({});
    });
    */
    /*
    it("does not reset state when external prop change", function () {
      //const prefilledProps = { bar: 'foo' } // TODO
      const changeCallback = () => "CHANGE";
      const wrapper = render(
        <DefaultForm model={Foos} changeCallback={changeCallback} />
      );
      wrapper.setState({ currentValues: { foo: "bar" } });
      expect(wrapper.state("currentValues")).toEqual({ foo: "bar" });
      const newChangeCallback = () => "NEW";
      wrapper.setProps({ changeCallback: newChangeCallback });
      expect(wrapper.state("currentValues")).toEqual({ foo: "bar" });
    });
    */
  });
});
