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
