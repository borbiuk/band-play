#!/usr/bin/env bash
# Prints the release notes of one version for the GitHub Release.
# Usage:
#   scripts/release-notes.sh <version> <ref>     the body of the section (without its summary line),
#                                                an install block and a compare link to the previous tag
#   scripts/release-notes.sh --title <version>   the summary line of the section (the release title)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_NOTES_PATH="${ROOT_DIR}/RELEASE_NOTES.md"
REPOSITORY="${GITHUB_REPOSITORY:-borbiuk/band-play}"

# The lines of the `## <version>` section, without the heading
section_of() {
	local version="$1"
	awk -v version="${version}" '
		$0 == "## " version { inside = 1; next }
		inside && /^## / { exit }
		inside { print }
	' "${RELEASE_NOTES_PATH}"
}

if [[ "${1:-}" == "--title" ]]; then
	version="${2:?usage: release-notes.sh --title <version>}"
	# The first line that is not empty is the summary
	section_of "${version}" | awk 'NF { print; exit }'
	exit 0
fi

version="${1:?usage: release-notes.sh <version> <ref>}"
ref="${2:?usage: release-notes.sh <version> <ref>}"

# Everything after the summary line
section_of "${version}" | awk 'found { print } NF && !found { found = 1 }'

cat <<INSTALL

### Install

- \`band-play-chrome-${version}.zip\`: unzip it, open \`chrome://extensions\`, turn on Developer mode and choose Load unpacked.
- \`band-play-firefox-${version}.zip\`: unzip it, open \`about:debugging\`, choose This Firefox and Load Temporary Add-on, then pick \`manifest.json\`.
INSTALL

previous="$(git -C "${ROOT_DIR}" describe --tags --abbrev=0 "${ref}^" 2>/dev/null || true)"
if [[ -n "${previous}" ]]; then
	echo
	echo "**Full Changelog**: https://github.com/${REPOSITORY}/compare/${previous}...${version}"
fi
