#!/usr/bin/env bash
# Sets the app version in every file that has to carry it, from one place.
# package.json is the source of truth for the frontend (src/utils/consts.ts
# imports it directly); this script mirrors that same value into the files
# nothing can import from JS: tauri.conf.json, Cargo.toml/Cargo.lock, and the
# flatpak AppStream metainfo.
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${1:?usage: ./bump-version.sh <version>, e.g. 4.1.0-rc1}"

# sed, not jq: jq's output would reformat these tab-indented files to 2-space indent.
sed -i "0,/^\t\"version\": /s/^\t\"version\": .*/\t\"version\": \"$VERSION\",/" package.json
sed -i "0,/^\t\"version\": /s/^\t\"version\": .*/\t\"version\": \"$VERSION\",/" src-tauri/tauri.conf.json

sed -i "0,/^version = /s/^version = .*/version = \"$VERSION\"/" src-tauri/Cargo.toml
# awk, not sed: Cargo.lock has one `version = ` line per [[package]] block, so a
# sed range up to the integrated-mod-manager block would rewrite every version
# line it passes over on the way there. Only touch the line right after our
# own package's `name = `.
awk -v v="$VERSION" '
  /^name = "integrated-mod-manager"$/ { found=1 }
  found && /^version = / { sub(/^version = .*/, "version = \"" v "\""); found=0 }
  { print }
' src-tauri/Cargo.lock > src-tauri/Cargo.lock.tmp && mv src-tauri/Cargo.lock.tmp src-tauri/Cargo.lock

DATE="$(date +%Y-%m-%d)"
sed -i "s|<release version=\"[^\"]*\" date=\"[^\"]*\" />|<release version=\"$VERSION\" date=\"$DATE\" />|" packaging/flatpak/jp.bhatt.wwmm.metainfo.xml

echo "Bumped to $VERSION in package.json, src-tauri/tauri.conf.json, src-tauri/Cargo.toml, src-tauri/Cargo.lock, packaging/flatpak/jp.bhatt.wwmm.metainfo.xml"
