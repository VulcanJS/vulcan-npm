#!/usr/bin/env zx
import "zx/globals";

const startersFolder = "starters";

const nextPrefix = `${startersFolder}/next`;
const nextRepo = "https://github.com/VulcanJS/vulcan-next.git";

await $`git subtree push ${nextRepo} main --prefix ${nextPrefix}`;
console.info("Pushed Vulcan Next to read-only starter repository");

/*
TODO: doesn't work, I don't know how to pull if someone changed the Vulcan Next repo via UI for instance
Currently we have to manually merge the change and then force a push, otherwise histories are unrelated
console.info(
  "If you need to pull first, use",
  `git subtree pull ${nextRepo} main --prefix ${nextPrefix}`
);
*/
// To force an update:  git push https://github.com/VulcanJS/vulcan-next.git `git subtree split --prefix starters/next`:main --forc
