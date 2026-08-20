#!/usr/bin/env bash
# Builds jp.bhatt.wwmm.yml from source with flatpak-builder.
# Regenerate cargo-sources.json / npm-sources.json first if Cargo.lock or
# package-lock.json changed (see README.md).
set -euo pipefail
cd "$(dirname "$0")"

flatpak install --user -y --noninteractive flathub \
	org.gnome.Sdk//49 \
	org.freedesktop.Sdk.Extension.rust-stable//25.08 \
	org.freedesktop.Sdk.Extension.node20//25.08

flatpak-builder --force-clean --user --install-deps-from=flathub \
	build-dir jp.bhatt.wwmm.yml "$@"
