# RES for Safari (macOS)

`safari/manifest.json` is the extension manifest; `safari/Reddit Enhancement Suite/` is the Xcode project for the
macOS container app that Safari requires. The project references the built extension in `dist/safari/`.

## Build and install

Requires Xcode and Node.

```sh
yarn                          # once
safari/build.sh --install     # build, copy to ~/Applications, register with Safari
```

Then in Safari:

1. Settings → Advanced → enable **Show features for web developers**
2. Settings → Developer → enable **Allow unsigned extensions**
3. Settings → Extensions → enable **Reddit Enhancement Suite**
4. On reddit, click the RES toolbar button → **Always Allow on This Website**

The build is ad-hoc signed ("Sign to Run Locally"), and Safari turns **Allow unsigned extensions** off again each time
it quits. To avoid that, sign with your Apple Development team:

1. Xcode → Settings → Accounts: add your Apple ID (a free account works), select its team, then
   **Manage Certificates… → + → Apple Development**.
2. Check that `security find-identity -v -p codesigning` lists it. If it says `0 valid identities`, install Apple's
   intermediate certificate: `curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer && open AppleWWDRCAG3.cer`
3. Your team ID is the `OU` of the certificate:
   `security find-certificate -c "Apple Development" -p | openssl x509 -noout -subject`
4. Build with it:

```sh
DEVELOPMENT_TEAM=XXXXXXXXXX safari/build.sh --install
```

Safari treats the signed build as a different extension from the unsigned one, so enable it (and grant reddit access)
again after switching.

After changing code, rerun `safari/build.sh --install` and reload the reddit tab.

## Keeping it running

A team-signed build survives Safari restarts and reboots with **Allow unsigned extensions** turned off. Day to day
there is nothing to do; just keep `~/Applications/Reddit Enhancement Suite.app` installed (you never need to open it).

Rebuild with `DEVELOPMENT_TEAM=XXXXXXXXXX safari/build.sh --install` when:

- **Your Apple Development certificate is about to expire** (check with
  `security find-certificate -c "Apple Development" -p | openssl x509 -noout -enddate`). Create a new one first in
  Xcode → Settings → Accounts → Manage Certificates → **+** → Apple Development.
- **RES disappears from Safari**, e.g. after a macOS or Safari update.

Your RES settings are kept across rebuilds as long as the bundle identifier and team stay the same. To be safe, save a
backup from RES settings → **Backup & Restore → File**.

## Updating to a new RES release

Merge upstream into this branch, then rebuild:

```sh
git remote add upstream https://github.com/honestbleeps/Reddit-Enhancement-Suite.git   # once
git fetch upstream
git merge upstream/master
yarn
DEVELOPMENT_TEAM=XXXXXXXXXX safari/build.sh --install
```

Reload any open reddit tabs afterwards. The Safari-specific changes are small and mostly live in `build.js`,
`safari/`, `locales/` and `lib/environment/`, so merge conflicts should be rare. If upstream adds or removes files in
`dist/`, add them to the extension target in the Xcode project too (the project references each built file
individually).

## Differences from Chrome/Firefox

- **History**: Safari has no `history` API. Filters based on visited links ("is visited", "comments opened") never
  match, and expanding media doesn't mark the link as visited.
- **Downloads**: Safari has no `downloads` API. The media download button saves via a blob URL, and falls back to opening
  the file in a new tab when the host doesn't allow cross-origin requests.
- **Backup providers** (Dropbox, Google Drive, OneDrive): Safari only provides `webRequest` to persistent background pages,
  so silent re-authentication isn't available, and you'll be asked to log in each time.

## Performance

- The background service worker is non-persistent, and loads translations on demand from `locales/*.json` instead
  of bundling all of them (background script ~70 KB instead of 3.4 MB). Content and options scripts are minified.
- Idle reddit tabs don't run timers: video autoplay management is event driven, and the thing-processing queue
  resets lazily.
