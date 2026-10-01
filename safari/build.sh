#!/bin/sh
# Builds the Safari extension and its macOS container app.
# Usage: safari/build.sh [--install]
#   DEVELOPMENT_TEAM=XXXXXXXXXX safari/build.sh   sign with your Apple Development team instead of ad-hoc
set -e
cd "$(dirname "$0")/.."

node build.js --mode ${MODE:-production} --browsers safari

VERSION=$(node -p "require('./package.json').version")
if [ -n "$DEVELOPMENT_TEAM" ]; then
	SIGNING="CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=$DEVELOPMENT_TEAM"
else
	SIGNING="CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY=- DEVELOPMENT_TEAM="
fi

# shellcheck disable=SC2086
xcodebuild -quiet \
	-project "safari/Reddit Enhancement Suite/Reddit Enhancement Suite.xcodeproj" \
	-scheme "Reddit Enhancement Suite" \
	-configuration Release \
	-derivedDataPath safari/build \
	MARKETING_VERSION="$VERSION" \
	$SIGNING \
	build

APP="safari/build/Build/Products/Release/Reddit Enhancement Suite.app"
echo "Built $APP ($VERSION)"

if [ "$1" = "--install" ]; then
	mkdir -p "$HOME/Applications"
	rm -rf "$HOME/Applications/Reddit Enhancement Suite.app"
	ditto "$APP" "$HOME/Applications/Reddit Enhancement Suite.app"
	# Keep Safari from listing the build output as a second copy of the extension
	/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -u "$APP"
	# Register the extension with Safari (the container app doesn't need to stay running)
	/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$HOME/Applications/Reddit Enhancement Suite.app"
	pluginkit -a "$HOME/Applications/Reddit Enhancement Suite.app/Contents/PlugIns/Reddit Enhancement Suite Extension.appex"
	echo "Installed to ~/Applications; enable it in Safari > Settings > Extensions"
fi
