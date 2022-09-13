#! /usr/bin/node
function run() {
  // TODO: this variable is not correctly set
  // So we return true for now
  // it should be defined by Yarn
  return process.exit(0)
  if ((process.env.PROJECT_CWD || "").match(/vulcan-npm/)) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}
run();
//#  @see https://yarnpkg.com/advanced/lifecycle-scripts/#environment-variables
//[[ "$PROJECT_CWD" == *"vulcan-npm"* ]]
