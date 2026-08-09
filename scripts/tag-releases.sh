#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_NOTES_PATH="${ROOT_DIR}/RELEASE_NOTES.md"
MANIFEST_PATH="public/manifest.json"
TAG_PREFIX="${TAG_PREFIX:-}"
DRY_RUN="${DRY_RUN:-0}"

if [[ ! -f "${RELEASE_NOTES_PATH}" ]]; then
  echo "Error: RELEASE_NOTES.md not found at ${RELEASE_NOTES_PATH}"
  exit 1
fi

get_version_from_manifest() {
  local commit="$1"
  git show "${commit}:${MANIFEST_PATH}" 2>/dev/null \
    | awk -F'"' '/"version"[[:space:]]*:/ {print $4; exit}'
}

find_commit_for_version() {
  local version="$1"
  while read -r commit; do
    local commit_version
    commit_version="$(get_version_from_manifest "${commit}" || true)"
    if [[ "${commit_version}" == "${version}" ]]; then
      echo "${commit}"
      return 0
    fi
  done < <(git rev-list --all -- "${MANIFEST_PATH}")

  return 1
}

versions="$(awk '/^## [0-9]+\.[0-9]+\.[0-9]+/ {print $2}' "${RELEASE_NOTES_PATH}")"
if [[ -z "${versions}" ]]; then
  echo "Error: No versions found in RELEASE_NOTES.md"
  exit 1
fi

echo "Using TAG_PREFIX='${TAG_PREFIX}' DRY_RUN='${DRY_RUN}'"

while read -r version; do
  [[ -z "${version}" ]] && continue

  tag="${TAG_PREFIX}${version}"
  if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
    echo "Skip ${tag}: already exists."
    continue
  fi

  commit="$(find_commit_for_version "${version}" || true)"
  if [[ -z "${commit}" ]]; then
    echo "Skip ${tag}: commit not found for version ${version}."
    continue
  fi

  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "Would tag ${tag} at ${commit}"
    continue
  fi

  git tag -a "${tag}" "${commit}" -m "Release ${version}"
  echo "Tagged ${tag} at ${commit}"
done <<< "${versions}"
