#!/usr/bin/env zx
import "zx/globals";

const startersFolder = "starters";

const expressPrefix = `${startersFolder}/express`;
const expressRepo = "https://github.com/VulcanJS/vulcan-express.git";
// @see https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt#L101
// Push will actually split already, no need to do this
//const subtreeHead = await $`git subtree split --prefix ${expressPrefix}`;
//console.info("Extracted subtree for express, head id:", subtreeHead);

await $`git subtree push ${expressRepo} main --prefix ${expressPrefix}`;
console.info("Pushed Vulcan Express to read-only starter repository");

const nextPrefix = `${startersFolder}/next`;
const nextRepo = "https://github.com/VulcanJS/vulcan-next.git";

await $`git subtree push ${nextRepo} main --prefix ${nextPrefix}`;
console.info("Pushed Vulcan Next to read-only starter repository");

const remixPrefix = `${startersFolder}/remix`;
const remixRepo = "https://github.com/VulcanJS/vulcan-remix.git";
// just an alias to respect Remix terminology
const remixRepoEurodance = "https://github.com/VulcanJS/eurodance-stack.git";

await $`git subtree push ${remixRepo} main --prefix ${remixPrefix}`;
await $`git subtree push ${remixRepoEurodance} main --prefix ${remixPrefix}`;
console.info("Pushed Vulcan Remix to read-only starter repository");
