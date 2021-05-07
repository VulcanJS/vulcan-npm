#! /bin/bash
# DEPRECATED: prefer using Yalc, which avoid this issue by maintaining a local store

# Avoid duplicate versions of React in root project by forcing the Vulcan NPM version
# @see https://github.com/VulcanJS/vulcan-npm/issues/5
# This guarantees we use the same peer dependencies when running the packages
cd ./node_modules/react && yarn link && cd ../..
cd ./node_modules/react-dom && yarn link && cd ../..
cd ./node_modules/@apollo/client && yarn link && cd ../../..
cd ./node_modules/mongoose && yarn link && cd ../..