# Wishlist

## Storefront

- Product cards show a heart at the top right. Clicking it saves/removes the product without opening its product page.
- The header heart shows the saved count and opens the wishlist.
- The wishlist provides product links, current prices, removal, an empty state, and retry for temporary request failures. Unpublished or unavailable products remain removable; a failed request never silently deletes a saved item.
- Product and resource cards inserted by filtering, search, or recommendations pick up their saved state automatically.

## Page setup without uploading merchant settings

The code works immediately at `/search?wishlist=1`. This is a normal Shopify URL returning a successful response, with the theme displaying the dedicated wishlist view. The header uses it automatically when no wishlist page exists.

For the conventional `/pages/wishlist` address, the merchant can create a **published online-store page** in Shopify:

1. Title: `My Wishlist` (or the merchant's preferred title).
2. URL handle: `wishlist`.
3. Leave the body empty and keep the default page template.
4. Save and publish the page to the Online Store.

The theme detects that page and automatically uses its URL in the header. Its main content becomes the wishlist view; the existing header and footer remain. No JSON template, page-body code, template assignment, or `settings_data.json` upload is required. Other page content is unaffected.

Creating/editing store content stays with the merchant under `AGENTS.md`. Deployment must wait until the merchant has saved any theme-editor changes.

## Theme settings

In **Theme settings → 愿望单**, the merchant can enable/disable the feature and separately show/hide the header entry. Turning the feature off hides the entry points and shows an unavailable message on the wishlist route; it does not read, write, or clear the saved device data. Re-enabling restores the existing list.

Product-card button controls include background color/opacity, heart outline color, saved-heart color, outer-border color/opacity/width, whole-button opacity, shape, surface size, and icon size. The hit area remains at least 44px. Header colors continue to follow the header theme.

These definitions live in `config/settings_schema.json`; merchant-selected values remain in `config/settings_data.json`, which must never be pushed. Deploy schema changes with an exact `--only config/settings_schema.json` scope alongside the changed code files, after confirming the editor is saved. Do not use a `config/*` wildcard.

## Persistence

- Primary key: `localStorage.missvella_wishlist_v1`. No application expiry.
- Backup: first-party cookie `mv_wishlist_v1`, `Max-Age=31536000`, `Path=/`, `SameSite=Lax`, and `Secure` on HTTPS.
- The newest valid timestamp wins when local storage and the cookie disagree. Explicit empty lists are persisted, preventing removed items from returning after reload.
- Only version, timestamp, and product handles are stored. Product names/images/prices are fetched from Shopify's locale-aware Product Ajax API in the customer's presentment currency.
- The list is limited to 100 products. Cookie payloads are capped at 3500 encoded characters to stay below browser cookie limits; larger lists use localStorage, and the outdated cookie is removed. If localStorage is unavailable, a list that cannot fit in the cookie fails visibly rather than claiming to save.
- If both persistent stores reject a write, the UI reports the failure and does not show a false saved state.
- Browser tabs synchronize through storage events; focus, visibility, and back/forward restoration also refresh state.
- Refreshing, changing pages, and restarting the browser preserve the list in normal browsing. It is scoped to the same site origin and browser profile, with no account or cross-device sync. Clearing website data, private-mode shutdown, browser eviction, or browser-enforced expiry can remove it.

API reference: https://shopify.dev/docs/api/ajax/reference/product

## Validation

Run `node scripts/test-wishlist.cjs` with Playwright available. Optional environment variables `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` select an existing installation. `WISHLIST_SCREENSHOT` optionally saves a mobile layout screenshot.

The browser suite covers toggle/removal, duplicated product cards, AJAX insertion/morphing, refresh, actual browser close/reopen with the same profile, cross-tab updates, stale/corrupt storage, cookie fallback, blocked stores, request failures/retry, HTML-safe product titles, request concurrency, and mobile/desktop overflow.

Also run `node --check theme/assets/mv-wishlist.js`, `shopify theme check --path theme --output json`, and `git diff --check`. The repository has existing unrelated Theme Check offenses; compare with the unchanged baseline.
