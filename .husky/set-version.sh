#!/bin/bash

# Get the version from manifest.json
version=$(jq -r '.version' public/manifest.json) || exit 1

# Stop before any file is touched when the version is missing or not x.y.z
if ! printf '%s' "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
	echo "Error: public/manifest.json has no valid version (got '$version')."
	exit 1
fi

# Write the version into a JSON file; the file is replaced only when jq succeeded
# $1 - path of the JSON file
set_json_version() {
	if ! jq --arg new_version "$version" '.version = $new_version' "$1" > "$1.tmp"; then
		rm -f "$1.tmp"
		echo "Error: could not update the version in $1."
		exit 1
	fi
	mv "$1.tmp" "$1" || exit 1
}

# Update the version in package.json
set_json_version package.json

# Keep the Firefox manifest version in sync with manifest.json
set_json_version public/manifest.firefox.json

# Restore tab indentation of the updated files
npx prettier --write package.json public/manifest.firefox.json --config ./.prettierrc.json > /dev/null || exit 1

echo "Version updated to: $version"
