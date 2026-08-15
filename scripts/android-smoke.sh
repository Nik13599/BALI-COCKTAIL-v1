#!/usr/bin/env bash
set -euo pipefail

APK="generated/android/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE="by.bali.cocktails"
ACTIVITY="$PACKAGE/.MainActivity"

if [ ! -f "$APK" ]; then
  echo "APK not found: $APK"
  exit 1
fi

echo "Installing BALI COCKTAIL APK on emulator..."
INSTALL_OUT="$(adb install -r "$APK")"
echo "$INSTALL_OUT"
grep -q 'Success' <<< "$INSTALL_OUT"

adb logcat -c
START_OUT="$(adb shell am start -W -n "$ACTIVITY")"
echo "$START_OUT"
grep -q 'Status: ok' <<< "$START_OUT"
sleep 4

PID="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
if [ -z "$PID" ]; then
  echo "BALI COCKTAIL process is not running after launch"
  exit 1
fi

# Confirm Android reports the BALI activity in the current activity stack.
if ! adb shell dumpsys activity activities | grep -q 'by.bali.cocktails/.MainActivity'; then
  echo "BALI COCKTAIL MainActivity was not found in the Android activity stack"
  adb shell dumpsys activity activities | tail -n 200
  exit 1
fi

# Ignore unrelated launcher/system ANRs; fail only for this application process.
if adb logcat -d | grep -E 'FATAL EXCEPTION.*|Process: by\.bali\.cocktails' | grep -q 'by\.bali\.cocktails'; then
  echo "BALI COCKTAIL crash detected"
  adb logcat -d | tail -n 300
  exit 1
fi

echo "BALI COCKTAIL installed and launched successfully on Android emulator. PID=$PID"
