#!/bin/bash

# Clean the build output and generate a fresh build
if [ -d "dist" ]; then
	rm -r "dist"
	echo "'dist' removed"
else
	echo "'dist' not found"
fi

npm run build

##########################################################
# Create a .zip file for the Chrome extension package    #
##########################################################

# Use build time and manifest version in the zip name
current_date_time=$(date +'%d-%m-%Y_%H:%M:%S')
version=$(jq '.version' dist/manifest.json | tr -d '"')
zip_filename="chrome-extension-example_${current_date_time}_${version}.zip"
temp_dir="chrome-extension-example-build"

# List of files to include in the package
include_files=(
	"dist/assets/logo-16.png"
	"dist/assets/logo-32.png"
	"dist/assets/logo-48.png"
	"dist/assets/logo-128.png"
	"dist/background.js"
	"dist/content.js"
	"dist/manifest.json"
	"dist/popup.html"
	"dist/popup.js"
	"dist/tab.html"
	"dist/tab.js"
)

# Create a temporary directory for packaging
mkdir "$temp_dir"

# Copy each file into the temporary directory
for file in "${include_files[@]}"; do
	# Remove the 'dist/' prefix to preserve the extension structure
	file_without_dist="${file#dist/}"

	# Ensure the destination path exists
	destination_dir="$temp_dir/$(dirname "$file_without_dist")"
	if [ ! -d "$destination_dir" ]; then
		mkdir -p "$destination_dir"
	fi

	# Copy the file into the temporary directory
	cp "$file" "$destination_dir/"
done

# Create the zip archive
zip -r "$zip_filename" "$temp_dir"

# Clean up the temporary directory
rm -r "$temp_dir"

echo "'$zip_filename' was created."
