#! /usr/bin/env bash

if [ "$1" == '-h' ] || [ "$1" == '--help' ]; then
  echo "
    Send system notifications using MacOs osascript
    notify <title?> <content?>
    "
  return
fi
if ! command -v osascript >/dev/null; then
  echo "osascript not found on \$PATH. You running this on MacOs right?"
  return 1
fi
title="Hello World"
text="Example notification. Use -h for help"
if [ "$1" ]; then
  title="$1"
fi
if [ "$2" ]; then
  text="$2"
fi

osascript -e "
    display notification \"$text\" with title \"$title\"
  "

if command -v say >/dev/null; then
  say "$title"
fi
