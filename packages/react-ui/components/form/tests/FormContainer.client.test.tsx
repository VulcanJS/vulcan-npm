/**
 * @client-only
 *
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/testing-react";

import * as stories from "./FormContainer.stories";

const { DefaultSmartForm } = composeStories(stories);

test("create an empty document", () => {
  render(<DefaultSmartForm />);
  const submitButton = screen.getByRole("button", { name: /submit/i });
  submitButton.click();
});
