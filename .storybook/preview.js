export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// Those events are triggered by the form when you activate
// warn on unsaved changes
// The end-user app should listen to those events to set route blocking
window.addEventListener("blocktransition", console.log);
window.addEventListener("unblocktransition", console.log);
