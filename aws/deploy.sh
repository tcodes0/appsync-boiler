#! /usr/bin/env bash
set -e

MODE=development
PROFILE=""
STACK_NAME='StagingStack-1' # see aws/constants.dev.ts line 20
COMMIT_SHA=$(git rev-parse HEAD)

if [ "$1" == prod ]; then
  MODE=production
  PROFILE="boiler-prod"
  # todo find a better way to do this
  # see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
  if [ ! "$ARE_YOU_SURE" ]; then
    echo "export env var ARE_YOU_SURE to deploy to prod!"
    exit 1
  else
    unset ARE_YOU_SURE
  fi
fi

exit
if [ ! "$STACK_NAME" ]; then
  echo "Please configure stack name in deploy.sh"
  exit 1
fi

# if [ ! -f ".env" ]; then
#   echo ".env not found, please copy .env.example and use that as a base"
#   exit 1
# fi

set -x

yarn cdk deploy "$STACK_NAME" \
  --require-approval=never \
  --profile="$PROFILE" \
  -c COMMIT_SHA="$COMMIT_SHA" \
  -c mode="$MODE"
