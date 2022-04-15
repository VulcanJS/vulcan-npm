export { defaultFormComponents } from "./formComponents";
export { defaultDatatableComponents } from "./datatableComponents";
export { defaultCellComponents } from "./cellComponents";
export { defaultCoreComponents } from "./coreComponents";

import { defaultFormComponents } from "./formComponents";
import { defaultDatatableComponents } from "./datatableComponents";
import { defaultCellComponents } from "./cellComponents";
import { defaultCoreComponents } from "./coreComponents";

/**
 * @deprecated 0.6.1
 * Use each type of components instead of loading all of them at once
 * This will avoid loading form and datatable components, that are very heavy, on every page
 * even when they are anot actually used
 */
export const defaultVulcanComponents = {
  ...defaultDatatableComponents,
  ...defaultCellComponents,
  ...defaultCoreComponents,
  ...defaultFormComponents,
};
