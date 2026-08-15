#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-generated}"

ANDROID="$ROOT/android"
IOS="$ROOT/ios"

if [ -d "$ANDROID" ]; then
  cp overrides/android/MainActivity.kt "$ANDROID/app/src/main/java/by/bali/cocktails/MainActivity.kt"
  cp overrides/android/AndroidManifest.xml "$ANDROID/app/src/main/AndroidManifest.xml"
  cp data/cocktails.json "$ANDROID/app/src/main/assets/cocktails.json"
  python3 scripts/patch-android-sync.py "$ANDROID/app/src/main/java/by/bali/cocktails/MainActivity.kt"
  rm -f "$ANDROID/app/src/main/res/drawable"/cocktail_*.jpg
  rm -f "$ANDROID/app/src/main/res/drawable"/classic_*.jpg
  rm -f "$ANDROID/app/src/main/res/drawable"/tiki_*.jpg
fi

if [ -d "$IOS" ]; then
  cp overrides/ios/ContentView.swift "$IOS/BALI_COCKTAIL/ContentView.swift"
  cp overrides/ios/DetailView.swift "$IOS/BALI_COCKTAIL/DetailView.swift"
  cp overrides/ios/PhotoStore.swift "$IOS/BALI_COCKTAIL/PhotoStore.swift"
  cp overrides/ios/Models.swift "$IOS/BALI_COCKTAIL/Models.swift"
  cp overrides/ios/OfficialMediaStore.swift "$IOS/BALI_COCKTAIL/OfficialMediaStore.swift"
  cp overrides/ios/project.yml "$IOS/project.yml"
  cp data/cocktails.json "$IOS/BALI_COCKTAIL/cocktails.json"
fi

echo "BALI COCKTAIL v1 overrides applied"
