#!/usr/bin/env zx
import "zx/globals";

const expressPrefix = "starters/express";
const expressRepo = "https://github.com/VulcanJS/vulcan-express.git";
// @see https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt#L101
const subtreeHead = await `git subtree split --prefix ${expressPrefix}`;
console.info("Extracted subtree for express, head id:", subtreeHead);

await `git subtree push ${expressRepo} main --prefix ${expressPrefix}`;
console.info("Pushed Vulcan Express to read-only starter repository");
