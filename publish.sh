#!/bin/bash

##########################################################
# Create a .zip file of Google Chrome extension package  #
##########################################################

current_date_time=$(date +'%d-%m-%Y_%H:%M:%S')
version=$(jq '.version' manifest.json | tr -d '"')
zip_filename="band-play-build_${current_date_time}_${version}.zip"
temp_dir="band-play-build"

include_files=(
	"assets/configuration.png"
	"assets/button.png"
	"assets/buymeacoffee.png"
	"assets/github.png"
	"assets/logo-16.png"
	"assets/logo-32.png"
	"assets/logo-48.png"
	"assets/logo-128.png"
	"manifest.json"
	"popup/popup.html"
	"popup/popup.js"
	"scripts/content.js"
)

# Create a temporary directory
mkdir "$temp_dir"

# Copy to the temporary directory
for file in "${include_files[@]}"; do
	IFS='/' read -ra file_parts <<<"$file"
	destination_dir="$temp_dir"
	for part in "${file_parts[@]::${#file_parts[@]}-1}"; do
		destination_dir="$destination_dir/$part"
		if [ ! -d "$destination_dir" ]; then
			mkdir "$destination_dir"
		fi
	done
	cp "$file" "$temp_dir/$file"
done

# Enter directory containing the built extension source.
cd "$temp_dir"

# Create a .zip file
zip -r "../$zip_filename" .

# Return to where we came from.
cd ..

# Clean up the temporary directory
rm -r "$temp_dir"

echo "'$zip_filename' was created."
