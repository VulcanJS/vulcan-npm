#!/bin/bash

# Copy the yarn.*.lock files generated for each starter app based on the root yarn.lock
# Check package.json "workspaces.entrypoints" for a list of the starter apps

NEXT_FILE="yarn.vulcan-next.lock"
NEXT_STARTER="starters/next"
# Test if a new lockfile has been generated
# and if it is different from the current file
if test -f $NEXT_FILE && (! cmp -s "$NEXT_FILE" "$NEXT_STARTER/$NEXT_FILE"); then
    echo "Updating Next starter lockfile"
    # Update the starter app yarn.lock
    mv --update $NEXT_FILE $NEXT_STARTER
else
    echo "NEXT starter lockfile already up to date"
    # Drop the generated yarn.next.lock since it's not currently needed
    rm -f $NEXT_FILE
fi

REMIX_FILE="yarn.vulcan-remix.lock"
REMIX_STARTER="starters/remix"
if test -f $REMIX_FILE && (! cmp -s "$REMIX_FILE" "$REMIX_STARTER/$REMIX_FILE"); then
    echo "Updating REMIX starter lockfile"
    mv --update $REMIX_FILE $REMIX_STARTER
else
    echo "REMIX starter lockfile already up to date"
    rm -f $REMIX_FILE
fi
EXPRESS_FILE="yarn.vulcan-express.lock"
EXPRESS_STARTER="starters/express"
if test -f $EXPRESS_FILE && (! cmp -s "$EXPRESS_FILE" "$EXPRESS_STARTER/$EXPRESS_FILE"); then
    echo "Updating EXPRESS starter lockfile"
    mv --update $EXPRESS_FILE $EXPRESS_STARTER
else
    echo "EXPRESS starter lockfile already up to date"
    rm -f $EXPRESS_FILE
fi
