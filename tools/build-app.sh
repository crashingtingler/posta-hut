#!/usr/bin/env bash
# Builds the Android app's copy of the game into app/www and syncs it into the Android project.
#   bash tools/build-app.sh          -> refresh app/www + cap sync
#   bash tools/build-app.sh apk      -> also build a debug APK and copy it to Downloads/posta-hut-debug.apk
# Ships the same files as the website (the list in sw.js), minus the guard editor and the offline helper.
cd "$(dirname "$0")/.." || exit 1
# tools this PC uses (installed 2026-11-19): Node.js, Temurin JDK 21, Android SDK in %LOCALAPPDATA%/Android/Sdk
[ -n "$JAVA_HOME" ] || export JAVA_HOME="$(ls -d "/c/Program Files/Eclipse Adoptium/jdk-21"* | head -1)"
[ -n "$ANDROID_HOME" ] || export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export PATH="$JAVA_HOME/bin:/c/Program Files/nodejs:$PATH"
bash tools/update-sw.sh >/dev/null
rm -rf app/www && mkdir -p app/www
files=$(sed -n '/^const FILES = \[/,/^\];/p' sw.js | grep -o '"[^"]*"' | tr -d '"' | grep -v -E '^(\./|editor\.html)$')
for f in $files; do mkdir -p "app/www/$(dirname "$f")"; cp "$f" "app/www/$f"; done
# mark the app build: no service worker, no install button, no editor, no outside tip links
sed -i 's#<head>#<head>\n<script>window.IS_APP = true; document.documentElement.classList.add("app");</script>#' app/www/index.html
echo "app/www: $(find app/www -type f | wc -l) files"
cd app || exit 1
npx cap sync android || exit 1
if [ "$1" = "apk" ]; then
  cd android && ./gradlew assembleDebug -q && cp app/build/outputs/apk/debug/app-debug.apk ~/Downloads/posta-hut-debug.apk && echo "APK: Downloads/posta-hut-debug.apk"
fi
