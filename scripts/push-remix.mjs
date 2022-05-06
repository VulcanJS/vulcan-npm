#!/usr/bin/env zx
import "zx/globals";

const startersFolder = "starters";
const remixPrefix = `${startersFolder}/remix`;
const remixRepo = "https://github.com/VulcanJS/vulcan-remix.git";
// just an alias to respect Remix terminology
const remixRepoEurodance = "https://github.com/VulcanJS/eurodance-stack.git";
// second alias cause we are ashamed of Eurodance :)
const remixRepoEnka = "https://github.com/VulcanJS/enka-stack.git";

await $`git subtree push ${remixRepo} main --prefix ${remixPrefix}`;
await $`git subtree push ${remixRepoEurodance} main --prefix ${remixPrefix}`;
await $`git subtree push ${remixRepoEnka} main --prefix ${remixPrefix}`;
console.info("Pushed Vulcan Remix to read-only starter repository");
