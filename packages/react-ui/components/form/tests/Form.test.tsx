import React from "react";
// TODO: for some reason we have to call it Form in storybook
import { Form, FormProps } from "../Form";
import expect from "expect";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
// @see https://storybook.js.org/addons/@storybook/react-testing
import { composeStories } from "@storybook/react-testing";
import * as stories from "./Form.stories"; // import all stories from the stories file
import {
  Addresses,
  ArrayOfObjects,
  Objects,
  ArrayOfUrls,
  ArrayFullCustom,
  ArrayOfCustomObjects,
  addressSchema,
} from "./fixtures/models";
// Every component that is returned maps 1:1 with the stories,
// but they already contain all decorators from story level, meta level and global level.
// => here the form comes with default I18n context and default components to simplify the setup
const { DefaultForm, ArrayOfUrlsForm, ArrayOfObjectsForm } =
  composeStories(stories);

// we must import all the other components, so that "registerComponent" is called

// @see https://github.com/storybookjs/storybook/pull/14550
// in the future, DefaultForm.args should have the required fields as well to avoid this cast
const defaultProps = DefaultForm.args as FormProps;
// helpers
// tests
describe("vulcan-forms/Form", function () {
  // since some props are now handled by HOC we need to provide them manually
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
        const { container } = render(
          <DefaultForm {...defaultProps} model={Addresses} />
        );
        expect(container).toBeDefined();
      });
    });
    describe("nested object (not in array)", function () {
      it("shallow render", () => {
        const { container } = render(
          <DefaultForm {...defaultProps} model={Objects} />
        );
        expect(container).toBeDefined();
      });
      it.skip("define one field", () => {
        /*
        TODO: rewrite using react-testing
        const { container, findByRole } = render(
          <DefaultForm {...defaultProps} model={Objects} />
        );
        const defaultGroup = findByRole("group").first();
        const fields = defaultGroup.prop("fields");
        expect(fields).toHaveLength(1); // addresses field
        */
      });

      // TODO: rewrite using React testing
      const getFormFields = (wrapper) => {
        const defaultGroup = wrapper.find("FormGroup").first();
        const fields = defaultGroup.prop("fields");
        return fields;
      };
      // TODO: rewrite using React testing
      const getFirstField = () => {
        const wrapper = render(<Form {...defaultProps} model={Objects} />);
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
        const { container } = render(<ArrayOfObjectsForm {...defaultProps} />);
        expect(container).toBeDefined();
      });
      it.skip("render a FormGroup for addresses", () => {
        const { container, getByRole } = render(
          <ArrayOfObjectsForm {...defaultProps} />
        );
        const group = getByRole("group");
        expect(group).toEqual("hello");
        /*
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfObjects} />
        );
        const formGroup = wrapper.find("FormGroup").find({ name: "addresses" });
        expect(formGroup).toBeDefined();
        expect(formGroup).toHaveLength(1);
        */
      });
      it.skip("passes down the array child fields", function () {
        /* TODO: update to react testing
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfObjects} />
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
          <Form
            {...defaultProps}
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
          <Form
            {...defaultProps}
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
          <Form
            {...defaultProps}
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
        /* TODO: update to React testing
        const wrapper = render(<Form {...defaultProps} model={ArrayOfUrls} />);
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
        */
      });
    });
    describe("array of objects with custom children inputs", function () {
      it.skip("render", function () {
        /* TODO update to react testing 
        const { container } = render(
          <Form {...defaultProps} model={ArrayOfCustomObjects} />
        );
        expect(container).toBeDefined();
        */
      });
      // TODO: does not work, schema_utils needs an update
      it.skip("passes down the custom input", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfCustomObjects} />
        );
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
      });
    });
    describe("array with a fully custom input (array itself and children)", function () {
      it.skip("shallow render", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayFullCustom} />
        );
        expect(wrapper).toBeDefined();
      });
      it.skip("passes down the custom input", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayFullCustom} />
        );
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
      });
    });
  });

  describe("Form state management", function () {
    // TODO: modern approach with hooks, is exporting the hook that manage state and testing it independently
    // TODO: the change callback is triggerd but `foo` becomes null instead of "bar
    /*
    // so it's added to the deletedValues and not changedValues
    it.skip("store typed value", function () {
      const wrapper = render(
        <Form {...defaultProps} model={Foos} />
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
        <Form {...defaultProps} model="Foos" collection={Foos} />
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
        <Form {...defaultProps} model={Foos} changeCallback={changeCallback} />
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
