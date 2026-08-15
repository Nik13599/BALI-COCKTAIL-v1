#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-generated}"

ANDROID="$ROOT/android"
IOS="$ROOT/ios"

if [ -d "$ANDROID" ]; then
  cp overrides/android/MainActivity.kt "$ANDROID/app/src/main/java/by/bali/cocktails/MainActivity.kt"
  cp overrides/android/AndroidManifest.xml "$ANDROID/app/src/main/AndroidManifest.xml"
  # Remove every bundled cocktail illustration/photo. Keep only the application icon.
  rm -f "$ANDROID/app/src/main/res/drawable"/cocktail_*.jpg
  rm -f "$ANDROID/app/src/main/res/drawable"/classic_*.jpg
  rm -f "$ANDROID/app/src/main/res/drawable"/tiki_*.jpg
fi

if [ -d "$IOS" ]; then
  cp overrides/ios/ContentView.swift "$IOS/BALI_COCKTAIL/ContentView.swift"
  cp overrides/ios/DetailView.swift "$IOS/BALI_COCKTAIL/DetailView.swift"
  cp overrides/ios/PhotoStore.swift "$IOS/BALI_COCKTAIL/PhotoStore.swift"
  cp overrides/ios/project.yml "$IOS/project.yml"
fi

echo "BALI COCKTAIL local-photo overrides applied"
