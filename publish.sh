#!/bin/bash

##########################################################
# Create an .zip file of Google Chrome extension package #
##########################################################

zip_filename="band-play-build.zip"
temp_dir="band-play-build"

include_dirs=("assets" "scripts")
include_files=("manifest.json")

# Create a temporary directory
mkdir "$temp_dir"

# Copy to the temporary directory
for dir in "${include_dirs[@]}"; do
    cp -r "$dir" "$temp_dir"
done

for file in "${include_files[@]}"; do
    cp "$file" "$temp_dir"
done

# Create a .zip file
zip -r "$zip_filename" "$temp_dir"

# Clean up the temporary directory
rm -r "$temp_dir"

echo "'$zip_filename' was created."
