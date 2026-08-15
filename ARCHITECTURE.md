# BALI COCKTAIL v1 architecture

## Goal
One repository contains the Android app, iOS app, admin panel, file-based catalogue and media.

## No database
The central catalogue is stored as versioned JSON files in `data/`. Official photos are stored in `media/`.

## Synchronization
Mobile clients read `data/manifest.json`. When `catalogVersion` changes, they download the latest cocktails, ingredients and official images, cache them locally, and continue to work offline.

## User photos
Photos made by a bartender remain local on that phone. Admin-controlled official photos are shared with all devices.

## Administration
The computer admin panel edits the JSON catalogue and media files and publishes changes to this repository. Publishing increments `catalogVersion`, which makes mobile clients refresh automatically.
