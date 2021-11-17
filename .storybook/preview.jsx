import React from "react";
import { IntlProvider } from "../packages/i18n";
// @see https://storybook.js.org/addons/msw-storybook-addon
import { initializeWorker, mswDecorator } from "msw-storybook-addon";
initializeWorker();

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// @see https://github.com/mswjs/examples/blob/master/examples/graphql-react-apollo/src/ApolloClient.js
import {
  InMemoryCache,
  HttpLink,
  ApolloClient,
  ApolloProvider,
} from "@apollo/client";
const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "http://localhost:3000/graphql",
  // Use explicit `window.fetch` so that outgoing requests
  // are captured and deferred until the Service Worker is ready.
  fetch: (...args) => fetch(...args),
});

// Do not try to use the "real" apollo client because it will try to auth users
const apolloClient = new ApolloClient({ cache, link });
/**
 * We wrap stories with a real ApolloProvider
 * @param {*} Story
 * @returns
 */
const apolloClientDecorator = (Story) => {
  return (
    <ApolloProvider client={apolloClient}>
      <Story />
    </ApolloProvider>
  );
};

export const decorators = [
  mswDecorator,
  apolloClientDecorator,
  (Story) => (
    <IntlProvider locale="fr">
      <Story />
    </IntlProvider>
  ),
];

// Those events are triggered by the form when you activate
// warn on unsaved changes
// The end-user app should listen to those events to set route blocking
window.addEventListener("blocktransition", console.log);
window.addEventListener("unblocktransition", console.log);
