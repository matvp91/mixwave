#!/bin/bash

declare -a arr=("api" "artisan" "dashboard" "stitcher")

dir=$(pwd)

for package in "${arr[@]}"
do
   cd $dir/packages/$package
   echo "👷 Building $package"
   pnpm run build
   docker build . --no-cache --platform linux/amd64,linux/arm64 --tag=mixwave/$package:latest
done