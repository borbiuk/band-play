#!/bin/bash

# Get the version from manifest.json
version=$(jq -r '.version' public/manifest.json)

# Update the version in package.json, preserving tabs
jq --arg new_version "$version" '.version = $new_version' package.json > package.json.tmp

# Preserve tabs in package.json
sed -e 's/  /\t/g' package.json.tmp > package.json

# Remove temporary file
rm package.json.tmp

# Add updated file
git add package.json

echo "Version updated to: $version"
