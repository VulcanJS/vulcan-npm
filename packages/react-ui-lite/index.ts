// TODO: move all react-ui components here and limit
// "react-ui" to exposing types and generic context providers
// Before doing that, we must have a clearer vision of the
// typings and generic hooks that should stay in "react-ui"
// VS purely visual elements that should come to "react-ui-lite"
export * from "./components/VulcanComponents/liteVulcanComponents/index.js";

//export { Loading } from "./components/core/Loading";
export * from "./components/core/index.js";
export { FormattedMessage } from "@vulcanjs/react-i18n";
