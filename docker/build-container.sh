#!/bin/bash
echo mixwave/$1
cd ./packages/$1
pnpm run build
docker build . --no-cache --tag=mixwave/$1:latest
docker push mixwave/$1:latest