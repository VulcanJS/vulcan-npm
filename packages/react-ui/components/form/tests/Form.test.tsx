import React from "react";
// TODO: should be loaded from Components instead?
import { Form, FormProps } from "../Form";
import expect from "expect";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
// @see https://storybook.js.org/addons/@storybook/react-testing
import { composeStories } from "@storybook/react-testing";
import * as stories from "../stories/Form.stories"; // import all stories from the stories file
// Every component that is returned maps 1:1 with the stories,
// but they already contain all decorators from story level, meta level and global level.
// => here the form comes with default I18n context and default components to simplify the setup
const { DefaultForm } = composeStories(stories);

// we must import all the other components, so that "registerComponent" is called
import { createModel } from "@vulcanjs/model";

// fixtures
const addressGroup = {
  name: "addresses",
  label: "Addresses",
  order: 10,
};
const permissions = {
  canRead: ["guests"],
  canUpdate: ["quests"],
  canCreate: ["guests"],
};

// just 1 input for state testing
const fooSchema = {
  foo: {
    type: String,
    ...permissions,
  },
};
//
const addressSchema = {
  street: {
    type: String,
    optional: true,
    ...permissions,
  },
};
// [{street, city,...}, {street, city, ...}]
const arrayOfObjectSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: addressSchema,
  },
};
// example with custom inputs for the children
// ["http://maps/XYZ", "http://maps/foobar"]
const arrayOfUrlSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: String,
    input: "url",
  },
};
// example with array and custom input
const CustomObjectInput = () => "OBJECT INPUT";
const arrayOfCustomObjectSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: addressSchema,
    input: CustomObjectInput,
  },
};
// example with a fully custom input for both the array and its children
const ArrayInput = () => "ARRAY INPUT";
const arrayFullCustomSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
    input: ArrayInput,
  },
  "addresses.$": {
    type: String,
    input: "url",
  },
};
// example with a native type
// ["20 rue du Moulin PARIS", "16 rue de la poste PARIS"]

// eslint-disable-next-line no-unused-vars
const arrayOfStringSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: String,
  },
};
// object (not in an array): {street, city}
const objectSchema = {
  addresses: {
    type: addressSchema,
    ...permissions,
  },
};
// without calling SimpleSchema
// eslint-disable-next-line no-unused-vars
const bareObjectSchema = {
  addresses: {
    type: addressSchema,
    ...permissions,
  },
};

// stub collection
const createDummyCollection = (typeName, schema) =>
  createModel({
    name: typeName + "s",
    //typeName,
    schema,
  });
const Foos = createDummyCollection("Foo", fooSchema);
const ArrayOfObjects = createDummyCollection(
  "ArrayOfObject",
  arrayOfObjectSchema
);
const Objects = createDummyCollection("Object", objectSchema);
const ArrayOfUrls = createDummyCollection("ArrayOfUrl", arrayOfUrlSchema);
const ArrayOfCustomObjects = createDummyCollection(
  "ArrayOfCustomObject",
  arrayOfCustomObjectSchema
);
const ArrayFullCustom = createDummyCollection(
  "ArrayFullCustom",
  arrayFullCustomSchema
);
// eslint-disable-next-line no-unused-vars
const ArrayOfStrings = createDummyCollection(
  "ArrayOfString",
  arrayOfStringSchema
);

const Addresses = createModel({
  name: "Addresses",
  //typeName: "Address",
  schema: addressSchema,
});

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
      it("shallow render", function () {
        const wrapper = render(
          <DefaultForm {...defaultProps} model={Addresses} />
        );
        expect(wrapper).toBeDefined();
      });
    });
    describe("nested object (not in array)", function () {
      it("shallow render", () => {
        const wrapper = render(<Form {...defaultProps} model={Objects} />);
        expect(wrapper).toBeDefined();
      });
      it.skip("define one field", () => {
        /* TODO: update to react testing 
        const wrapper = render(<Form {...defaultProps} model={Objects} />);
        const defaultGroup = wrapper.find("FormGroup").first();
        const fields = defaultGroup.prop("fields");
        expect(fields).toHaveLength(1); // addresses field
        */
      });

      const getFormFields = (wrapper) => {
        const defaultGroup = wrapper.find("FormGroup").first();
        const fields = defaultGroup.prop("fields");
        return fields;
      };
      const getFirstField = () => {
        const wrapper = render(<Form {...defaultProps} model={Objects} />);
        const fields = getFormFields(wrapper);
        return fields[0];
      };
      it("define the nestedSchema", () => {
        const addressField = getFirstField();
        expect(addressField.nestedSchema.street).toBeDefined();
      });
    });
    describe("array of objects", function () {
      it.skip("renders", () => {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfObjects} />
        );
        expect(wrapper).toBeDefined();
      });
      it("render a FormGroup for addresses", function () {
        /*
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfObjects} />
        );
        const formGroup = wrapper.find("FormGroup").find({ name: "addresses" });
        expect(formGroup).toBeDefined();
        expect(formGroup).toHaveLength(1);
        */
      });
      it("passes down the array child fields", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfObjects} />
        );
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.nestedInput).toBe(true);
        expect(arrayField.nestedFields).toHaveLength(
          Object.keys(addressSchema).length
        );
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
      it("shallow render", function () {
        const wrapper = render(<Form {...defaultProps} model={ArrayOfUrls} />);
        expect(wrapper).toBeDefined();
      });
      it("passes down the array item custom input", () => {
        const wrapper = render(<Form {...defaultProps} model={ArrayOfUrls} />);
        const formGroup = getArrayFormGroup(wrapper);
        const fields = getFields(formGroup);
        const arrayField = fields[0];
        expect(arrayField.arrayField).toBeDefined();
      });
    });
    describe("array of objects with custom children inputs", function () {
      it("shallow render", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayOfCustomObjects} />
        );
        expect(wrapper).toBeDefined();
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
      it("shallow render", function () {
        const wrapper = render(
          <Form {...defaultProps} model={ArrayFullCustom} />
        );
        expect(wrapper).toBeDefined();
      });
      it("passes down the custom input", function () {
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
