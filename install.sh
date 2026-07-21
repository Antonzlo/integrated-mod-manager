#!/bin/bash

set -e

# Configuration
APP_NAME="integrated-mod-manager-imm"
DISPLAY_NAME="Integrated Mod Manager (IMM)"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
UPDATE_URL="https://github.com/jpbhatt21/integrated-mod-manager/releases/latest/download/latest.json"

# Dependency check
for cmd in curl jq mktemp mkdir cp chmod; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: Required command '$cmd' is not installed."
    exit 1
  fi
done

# Fetch latest release URL
echo "Fetching latest release information..."
APPIMAGE_URL=$(curl -sL "$UPDATE_URL" | jq -r '.platforms."linux-appimage".url')

if [ -z "$APPIMAGE_URL" ] || [ "$APPIMAGE_URL" == "null" ]; then
  echo "Error: Could not retrieve AppImage download URL from $UPDATE_URL"
  exit 1
fi
# Download AppImage with progress bar
TEMP_DIR=$(mktemp -d)
TEMP_APPIMAGE="$TEMP_DIR/$APP_NAME.AppImage"

echo "Downloading AppImage from $APPIMAGE_URL..."
curl -L -# "$APPIMAGE_URL" -o "$TEMP_APPIMAGE"

# Ensure target directories exist
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Move AppImage to installation directory and set executable permissions
DEST_APPIMAGE="$INSTALL_DIR/$APP_NAME.AppImage"
mv "$TEMP_APPIMAGE" "$DEST_APPIMAGE"
chmod +x "$DEST_APPIMAGE"

# Extract and install icon
cd "$TEMP_DIR"
"$DEST_APPIMAGE" --appimage-extract >/dev/null 2>&1 || true

if [ -d "squashfs-root" ]; then
  FOUND_ICON=$(find squashfs-root -maxdepth 2 -name "*.png" -o -name "*.svg" | head -n 1)
  if [ -n "$FOUND_ICON" ]; then
    cp "$FOUND_ICON" "$ICON_DIR/$APP_NAME.${FOUND_ICON##*.}"
  fi
  rm -rf squashfs-root
fi
cd - >/dev/null
rm -rf "$TEMP_DIR"

# Create .desktop entry
cat <<EOF > "$DESKTOP_DIR/$APP_NAME.desktop"
[Desktop Entry]
Name=$DISPLAY_NAME
Exec=$DEST_APPIMAGE
Icon=$APP_NAME
Type=Application
Terminal=false
Categories=Utility;
EOF

chmod +x "$DESKTOP_DIR/$APP_NAME.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR"
fi

echo "Installation complete! $DISPLAY_NAME is now available in your application menu."
