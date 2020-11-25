#! /bin/bash

# Avoid duplicate versions of React in root project by forcing the Vulcan NPM version
# @see https://github.com/VulcanJS/vulcan-npm/issues/5
# => this is avoided by using peerDependencies
cd ./node_modules/react && yarn link && cd ../..
cd ./node_modules/react-dom && yarn link && cd ../..