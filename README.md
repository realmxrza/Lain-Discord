# Lain Desktop Pet

Credit: https://github.com/ad044/lain-bootleg-bootleg

The repository provides two supported installation methods:

1. Install the Vencord plugin.
2. Build a JavaScript snippet for a website.

## What Lain does
she walks and do some silly stuff

## Requirements

- Node.js 22 or newer.
- pnpm for a Vencord build.
- A Vencord source directory for the Vencord method.

## Install the Vencord plugin

The installer copies the plugin to `src/userplugins/LainPet` then builds it.

Run either one of these commands from the root of the repository:

```sh
node install.mjs vencord --vencord-dir /path/to/Vencord
```

```sh
node install.mjs vencord
```

The installer replaces the existing `src/userplugins/LainPet` folder.
Save local changes before you run the installer.

To copy the plugin without a build, run:

```sh
node install.mjs vencord --vencord-dir /path/to/Vencord --no-build
```

### Use the plugin in Vesktop

1. Build the plugin with the installer.
2. Open Vesktop.
3. Open Vesktop Settings.
4. Find the `Vencord Location` setting.
5. Select the `dist` folder inside your Vencord source directory.
6. Close Vesktop.
7. Start Vesktop again.
8. Open User Settings.
9. Open Vencord Plugins.
10. Enable `LainPet`.

### Use plugin commands

Open a Discord channel and enter `/lain`.

```text
/lain action:express
/lain action:speak
```

`express` shows one of her reaction faces for a few seconds.
`speak` picks a random line and shows it in the bubble above her.

## Build a website JavaScript snippet

Build the snippet, then copy it into your website directory:

```sh
node install.mjs snippet --output ./public/lainpet.js
```

Load it from your page:

```html
<script src="/lainpet.js" defer></script>
```

The script starts Lain by itself and creates `window.LainPet`.
Use these methods from the browser console or from your website code:

```js
window.LainPet.speak("Hello from the Wired.");
window.LainPet.express();
window.LainPet.start();
window.LainPet.stop();
```

## Assets

Every image is inlined into `LainPet/data/assets.ts` as a base64 data URI, so
neither the plugin nor the snippet asks a server for anything at runtime.
The installer regenerates that file for you before each build.

If you add or change a file under `/assets`, list it in
`scripts/generate-assets.mjs` and run:

```sh
node scripts/generate-assets.mjs
```

## Installer options

```sh
node install.mjs help
node install.mjs vencord --vencord-dir /path/to/Vencord --dry-run
node install.mjs snippet --output ./public/lainpet.js --dry-run
```
