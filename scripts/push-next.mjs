#!/usr/bin/env zx
import "zx/globals";

const startersFolder = "starters";

const nextPrefix = `${startersFolder}/next`;
const nextRepo = "https://github.com/VulcanJS/vulcan-next.git";

await $`git subtree push ${nextRepo} main --prefix ${nextPrefix}`;
console.info("Pushed Vulcan Next to read-only starter repository");
