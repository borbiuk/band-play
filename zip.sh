#!/bin/bash

# Re-create a build of extension by webpack to dist directory
if [ -d "dist" ]; then
	rm -r "dist"
	echo "'dist' removed"
else
	echo "'dist' no found"
fi
npm run build

##########################################################
# Create a .zip file of Google Chrome extension package  #
##########################################################

current_date_time=$(date +'%d-%m-%Y_%H:%M:%S')
version=$(jq '.version' dist/manifest.json | tr -d '"')
zip_filename="band-play-build_${current_date_time}_${version}.zip"
temp_dir="band-play-build"

# Files that will be included to .zip
include_files=(
	"dist/assets/bandcamp.png"
	"dist/assets/buymeacoffee.png"
	"dist/assets/github.png"
	"dist/assets/logo-16.png"
	"dist/assets/logo-32.png"
	"dist/assets/logo-48.png"
	"dist/assets/logo-128.png"
	"dist/assets/rate.png"
	"dist/background.js"
	"dist/content.js"
	"dist/manifest.json"
	"dist/popup.html"
	"dist/popup.js"
	"dist/vendor.js"
)

# Create a temporary directory
mkdir "$temp_dir"

# Copy to the temporary directory
for file in "${include_files[@]}"; do
	# Remove the 'dist/' prefix from the file path
	file_without_dist="${file#dist/}"

	# Create the destination directory
	destination_dir="$temp_dir/$(dirname "$file_without_dist")"
	if [ ! -d "$destination_dir" ]; then
		mkdir -p "$destination_dir"
	fi

	# Copy the file to the temporary directory
	cp "$file" "$destination_dir/"
done

# Create a .zip file
zip -r "$zip_filename" "$temp_dir"

# Clean up the temporary directory
rm -r "$temp_dir"

echo "'$zip_filename' was created."
