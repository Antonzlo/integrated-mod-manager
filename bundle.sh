#write a bash script to: read package.json and get the version number from it
#copy files- 'Integrated Mod Manager (IMM)_${ver}_amd64.deb' and 'Integrated Mod Manager (IMM)_${ver}_amd64.deb.sig' from /src-tauri/target/release/bundle/deb/ to /.bundle/deb/
#copy files- 'Integrated Mod Manager (IMM)_${ver}_amd64.AppImage' and 'Integrated Mod Manager (IMM)_${ver}_amd64.AppImage.sig' from /src-tauri/target/release/bundle/appimage/ to /.bundle/appimage/
#copy files- 'Integrated Mod Manager (IMM)-${ver}-1.x86_64.rpm' and 'Integrated Mod Manager (IMM)-${ver}-1.x86_64.rpm.sig' from /src-tauri/target/release/bundle/rpm/ to /.bundle/rpm/

#!/bin/bash
# Read version number from package.json
ver=$(jq -r '.version' package.json)

# Create destination directories if they don't exist

mkdir -p ./.bundle/deb/
mkdir -p ./.bundle/appimage/
mkdir -p ./.bundle/rpm/

# Copy .deb files
cp "./src-tauri/target/release/bundle/deb/Integrated Mod Manager (IMM)_${ver}_amd64.deb" "./.bundle/deb/"
cp "./src-tauri/target/release/bundle/deb/Integrated Mod Manager (IMM)_${ver}_amd64.deb.sig" "./.bundle/deb/"

# Copy .AppImage files
cp "./src-tauri/target/release/bundle/appimage/Integrated Mod Manager (IMM)_${ver}_amd64.AppImage" "./.bundle/appimage/"
cp "./src-tauri/target/release/bundle/appimage/Integrated Mod Manager (IMM)_${ver}_amd64.AppImage.sig" "./.bundle/appimage/"

# Copy .rpm files
cp "./src-tauri/target/release/bundle/rpm/Integrated Mod Manager (IMM)-${ver}-1.x86_64.rpm" "./.bundle/rpm/"
cp "./src-tauri/target/release/bundle/rpm/Integrated Mod Manager (IMM)-${ver}-1.x86_64.rpm.sig" "./.bundle/rpm/"

echo "Files copied successfully for version ${ver}."

#compress the .bundle directory into a zip file
7z  a -tzip "bundle.zip" ./.bundle/
