# Lain Desktop Pet

Lain is a desktop pet for Vencord and web pages created by realmxrza.

The repository provides two supported installation methods:

1. Install the Vencord plugin.
2. Build a JavaScript snippet for a website.

## Requirements

- Node.js 22 or newer.
- pnpm for a Vencord build.
- A Vencord source directory for the Vencord method.

## Install the Vencord plugin

The installer copies the plugin to `src/userplugins/LainPet` then builds it.

Run either one of these command from the root of the repository:

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
/lain action:roll
/lain action:dance
/lain action:navi
/lain action:crow
/lain action:girl
/lain action:express
/lain action:speak
```

## Build a website JavaScript snippet

Add your lainpet.js file to your website directory and load it like so:

```html
<script src="/lainpet.js" defer></script>
```

The script creates `window.LainPet`.
Use these methods from the browser console or from your website code:

```js
window.LainPet.speak("Hello from the Wired.");
window.LainPet.setOutfit("pink");
window.LainPet.forceDance();
window.LainPet.dropNavi();
window.LainPet.spawnCrow();
window.LainPet.spawnGirl();
window.LainPet.sugarRush();
window.LainPet.stop();
```

## Installer options

```sh
node install.mjs help
node install.mjs vencord --vencord-dir /path/to/Vencord --dry-run
node install.mjs snippet --output ./public/lainpet.js --dry-run
```
