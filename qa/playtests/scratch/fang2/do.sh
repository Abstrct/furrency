#!/bin/zsh
# usage: do.sh '<json>'   (posts action, prints look + timestamp)
echo "== $(date '+%H:%M:%S')"
curl -s -X POST http://127.0.0.1:9600/t/fang2/do -d "$1"
