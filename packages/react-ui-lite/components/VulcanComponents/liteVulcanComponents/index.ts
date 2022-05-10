export { liteFormComponents } from "./formComponents";
export { liteDatatableComponents } from "./datatableComponents";
export { liteCellComponents } from "./cellComponents";
export { liteCoreComponents } from "./coreComponents";

import { liteFormComponents } from "./formComponents";
import { liteDatatableComponents } from "./datatableComponents";
import { liteCellComponents } from "./cellComponents";
import { liteCoreComponents } from "./coreComponents";

/**
 * @deprecated 0.6.1
 * Use each type of components instead of loading all of them at once
 * This will avoid loading form and datatable components, that are very heavy, on every page
 * even when they are anot actually used
 */
export const liteVulcanComponents = {
  ...liteDatatableComponents,
  ...liteCellComponents,
  ...liteCoreComponents,
  ...liteFormComponents,
};
