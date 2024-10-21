#!/bin/bash

declare -a arr=("api" "artisan" "app" "stitcher")

for package in "${arr[@]}"
do
   docker push superstreamerapp/$package:latest
   echo "✅ Published $package"
done
