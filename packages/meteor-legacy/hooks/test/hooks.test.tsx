//import React from "react";
//import gql from 'graphql-tag';
//import { initComponentTest } from 'meteor/vulcan:test';
import {
  useCurrentUser,
  useLogout,
  useAuthenticateWithPassword,
  useSignup,
} from "../index";

describe("meteor-legacy/hooks", function () {
  describe("exports", () => {
    test("export relevant hooks", () => {
      expect(useCurrentUser).toBeInstanceOf(Function);
      expect(useLogout).toBeInstanceOf(Function);
      expect(useSignup).toBeInstanceOf(Function);
      expect(useAuthenticateWithPassword).toBeInstanceOf(Function);
    });
  });
});
