#!/usr/bin/env zx
import "zx/globals";

const startersFolder = "starters";

const nextPrefix = `${startersFolder}/next`;
const nextRepo = "https://github.com/VulcanJS/vulcan-next.git";

await $`git subtree push ${nextRepo} main --prefix ${nextPrefix}`;
console.info("Pushed Vulcan Next to read-only starter repository");

console.info(
  "If you need to pull first, use",
  `git subtree pull ${nextRepo} main --prefix ${nextPrefix}`
);
