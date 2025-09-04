# Sonic Prompt Engine PWA

This project is configured as a Progressive Web App ready for installation and Android packaging.

## PWA Features
- [`manifest.webmanifest`](public/manifest.webmanifest) defines app name, icons, colors and other metadata required for install.
- [`sw.js`](public/sw.js) applies a stale‑while‑revalidate cache to all requests and falls back to cached pages when offline.
- [`PWAInstallPrompt`](src/components/PWAInstallPrompt.tsx) shows a custom install banner whenever the app is opened and the user has not installed it. The prompt is suppressed only for the current session or for the optional interval defined by `PROMPT_INTERVAL_DAYS`.

## Testing Installability
1. Run the app locally with `npm run dev` or serve a production build.
2. Open Chrome DevTools and navigate to **Application → Manifest** to verify the manifest and check installability.
3. Use Lighthouse in DevTools (**Lighthouse → Progressive Web App**) to audit PWA compliance.

## Building an Android APK with Bubblewrap
1. Install Bubblewrap: `npm install -g @bubblewrap/cli`.
2. Initialize a project using the hosted manifest:
   ```bash
   bubblewrap init --manifest=https://sonic-prompt-craft.app/manifest.webmanifest
   ```
3. Build the APK:
   ```bash
   bubblewrap build
   ```
4. Sign and install the generated APK on your device or upload to stores.

