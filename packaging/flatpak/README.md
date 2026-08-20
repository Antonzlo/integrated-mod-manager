# Flatpak build

`jp.bhatt.wwmm.yml` builds the app from source inside the flatpak sandbox
(no prebuilt binary, no committed `7zz` binary). It vendors dependencies via
two generated files so `flatpak-builder`'s build-commands run with no
network access, matching how Flathub-eligible builds work.

## Build

```sh
./build.sh
```

Installs the required runtime, SDK, and SDK extensions (from Flathub) if
missing, then runs `flatpak-builder`. Output goes to `build-dir/`. Install
and run it with:

```sh
flatpak-builder --user --install build-dir jp.bhatt.wwmm.yml
flatpak run jp.bhatt.wwmm
```

## Regenerating the vendored sources

`cargo-sources.json` and `npm-sources.json` pin every crate/npm package by
URL and checksum, generated from the lockfiles by
[flatpak-builder-tools](https://github.com/flatpak/flatpak-builder-tools).
Regenerate them whenever `src-tauri/Cargo.lock` or `package-lock.json`
changes:

```sh
git clone --depth 1 https://github.com/flatpak/flatpak-builder-tools /tmp/fbt
python3 -m venv /tmp/fbt-venv
/tmp/fbt-venv/bin/pip install aiohttp pyyaml tomlkit

/tmp/fbt-venv/bin/python3 /tmp/fbt/cargo/flatpak-cargo-generator.py \
	../../src-tauri/Cargo.lock -o cargo-sources.json

PYTHONPATH=/tmp/fbt/node /tmp/fbt-venv/bin/python3 -m flatpak_node_generator \
	npm ../../package-lock.json -o npm-sources.json
```

Use `package-lock.json` (npm), not `pnpm-lock.yaml` — the frontend build
breaks under pnpm's strict `node_modules` layout (undeclared transitive dep
on `embla-carousel`), so the flatpak module also builds with `npm ci`.

## Gotchas (all still apply, from the pre-source-build manifest)

- **7-Zip binaries**: `imm` module downloads official 7-zip.org release
  archives (26.00) instead of vendoring binaries in git. Update the
  `url`/`sha256` pairs when bumping the 7-Zip version.
- **Resource path for 7zz**: Tauri resolves `BaseDirectory::Resource` to
  `/app/lib/${productName}`, and `productName` is the literal string
  `Integrated Mod Manager (IMM)` (spaces and parens included, from
  `src-tauri/tauri.conf.json`) — NOT the crate name. 7zz must be installed
  to that exact path or extraction silently fails at runtime.
- **appindicator libs**: the runtime doesn't ship
  `libayatana-appindicator3`/`libayatana-indicator3`/`libayatana-ido3-0.4`/
  `libdbusmenu-gtk3`/`libdbusmenu-glib`, needed for the tray icon. Pulled in
  via `shared-modules/libappindicator/libappindicator-gtk3-12.10.json`.
- **xdg-mime**: the deep-link plugin runs `xdg-mime` at startup and panics
  if it's missing, hence the `xdg-utils` module.
- **DMABUF**: `--env=WEBKIT_DISABLE_DMABUF_RENDERER=1` in `finish-args`
  avoids a `Gdk Error 71` under KWin (GBM buffer failure).
- **`tauri/custom-protocol` cargo feature**: `tauri build` (the CLI) enables
  this automatically; a raw `cargo build` does not. Without it the binary
  compiles fine but launches to a blank, transparent window trying to reach
  `http://localhost:3420` (the dev server URL) instead of serving the
  embedded frontend, because Tauri's `#[cfg(dev)]` gate is driven by this
  feature flag, not by the release/debug build profile. The manifest passes
  `--features tauri/custom-protocol` to `cargo build` for exactly this
  reason — don't drop it.
- **Archive `strip-components` defaults to 1** in flatpak-builder (assumes a
  release-tarball-style wrapping directory). The 7-Zip tarballs have no such
  wrapper, so the 7zz sources set `strip-components: 0` — without it every
  top-level file in the archive (including `7zz` itself) silently vanishes
  during extraction.
- **Hotreload is broken in this build.** `src-tauri/src/hotreload.rs` calls
  `flatpak-spawn --host xdotool/ydotool/...`, which needs
  `--talk-name=org.freedesktop.Flatpak` in `finish-args`. That permission
  was intentionally dropped (see git history: "Remove Wine launch on Linux")
  to avoid granting broad host-command execution. Not fixed yet — the fix is
  to bundle `xdotool`/`ydotool` as their own flatpak modules running inside
  the sandbox (`xdotool` against the existing `--socket=fallback-x11`,
  `ydotool` against `--device=input`) instead of spawning the host's copy.
