#!/bin/bash

# stop at the first failing command, so a failed build or zip never reports success
set -euo pipefail

# Files that will be included to .zip (paths are relative to the build directory)
include_files=(
	"assets/icon-16.png"
	"assets/icon-32.png"
	"assets/icon-48.png"
	"assets/icon-128.png"
	"assets/logo-128.png"
	"assets/logo-store-128.png"
	"assets/nextprev.png"
	"background.js"
	"content.js"
	"downloads.html"
	"downloads.js"
	"manifest.json"
	"options.html"
	"options.js"
)

# Re-create a build of extension by webpack and create a .zip file of the extension package.
# $1 - browser name used in the .zip file name (chrome | firefox)
# $2 - build directory created by webpack (dist | dist-firefox)
# $3 - npm script that builds the extension (build | build:firefox)
create_package() {
	local browser="$1"
	local build_dir="$2"
	local build_script="$3"

	# Re-create a build of extension by webpack to the build directory
	if [ -d "$build_dir" ]; then
		rm -r "$build_dir"
		echo "'$build_dir' removed"
	else
		echo "'$build_dir' not found"
	fi
	npm run "$build_script" || exit 1

	local current_date_time
	current_date_time=$(date +'%d-%m-%Y_%H:%M:%S')

	local version
	version=$(jq -r '.version' "$build_dir/manifest.json")

	local zip_filename="band-play-build-${browser}_${current_date_time}_${version}.zip"

	# Packages go to artifacts/ (gitignored). The path is absolute, because zip runs in the temporary folder
	local output_dir
	output_dir="$(pwd)/artifacts"
	mkdir -p "$output_dir"

	# Create a temporary folder outside the repository (removed again when a later step fails)
	local temp_dir
	temp_dir="$(mktemp -d)"
	# Expanded now: the local variable is gone when the trap runs
	trap "rm -rf '${temp_dir}'" EXIT

	# Copy to the temporary directory
	for file in "${include_files[@]}"; do
		# Create the destination directory
		local destination_dir="$temp_dir/$(dirname "$file")"
		if [ ! -d "$destination_dir" ]; then
			mkdir -p "$destination_dir"
		fi

		# Copy the file to the temporary directory
		cp "$build_dir/$file" "$destination_dir/" || exit 1
	done

	# Create a .zip file with the extension files at the archive root
	# (required by addons.mozilla.org, accepted by Chrome Web Store)
	(cd "$temp_dir" && zip -r "$output_dir/$zip_filename" .) || exit 1

	# Clean up the temporary directory
	rm -r "$temp_dir"
	trap - EXIT

	echo "'$output_dir/$zip_filename' was created."
}

###############################################################
# Create .zip files of Chrome and Firefox extension packages  #
###############################################################

create_package "chrome" "dist" "build"
create_package "firefox" "dist-firefox" "build:firefox"
