# BALI COCKTAIL branding

`branding/app-icon.png` is the single canonical application icon. It is the exact BALI COCKTAIL artwork supplied by the owner, converted only to a valid 1024×1024 PNG for platform packaging.

Display names:
- user apps: `BALI COCKTAIL`
- administrator apps: `BALI COCKTAIL ADMIN`

Every Android, iPhone/iOS and Windows build must derive its platform icon from `branding/app-icon.png`. Do not redraw, recolor or substitute another icon. The only distinction between user and administrator builds is the application display name.

`mobile-admin/icon.b64` is retained only as the original seed used to reconstruct the canonical PNG and must not be used directly by Linux/Windows packagers.
