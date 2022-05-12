/**
 * Add custom eslint rules for Vulcan NPM here
 * @see https://eslint.org/docs/developer-guide/working-with-rules
 *
 * To update, run yarn add -D ./packages/eslint-vulcan-internal
 *
 * TODO: not yet used
 * We should add a rule to prevent packages self imports
 */
module.exports.rules = {
  /*
TODO: detect import { useTranslation } from "next-i18next" or
import { useTranslation } from "react-i18next"
 and suggest importing from ~/lib/i18n instead
  "vulcan/i18n": (context) => ({

    VariableDeclarator: (node) => {
      if (node.id.name.length < 2) {
        context.report(
          node,
          "Variable names should be longer than 1 character"
        );
      }
    },
  }),
  */
  //"media-print": {
  //  meta: {
  //    type: "problem",
  //  },
  //  create: (context) => ({
  //    Property: (node) => {
  //      if (node.key && node.key.value === "@media print") {
  //        context.report({
  //          node,
  //          message:
  //            "Do not use '@media print' directly, instead use the '...mediaPrint({ /* yourStyle */)' helper.",
  //        });
  //      }
  //    },
  //  }),
  //},
};
