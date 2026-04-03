# Wired Pet: Lain V3.0
<img width="672" height="444" alt="image" src="https://github.com/user-attachments/assets/ae11ead5-fb71-4b9a-914f-d89abb669aaa" />

### ( JS SNIPPETS )
1. Press `Ctrl` + `Shift` + `I` to open Developer Tools.
2. Go to the **Console** tab.
3. If it is your first time, type `allow pasting` and press `Enter`.
4. Copy the code from `Lain.js`.
5. Paste it into the console.
6. Hit `Enter`.

### ( VENCORD PRELOAD )
[Download Lain.js](./Lain.js)
1. Press `Win` + `R` on your keyboard.
2. Paste `%appdata%\Vencord` and press `Enter`.
3. Open the `dist` folder.
4. Place your `Lain.js` file inside this folder.
5. Open `preload.js` with Notepad or a code editor.
6. Scroll to the very bottom and paste the following line:
   `require("./Lain.js");`
7. Save the file and restart Discord.

### ( VENCORD PLUGIN )
[Download index.tsx](./index.tsx)
1. Clone or open your local Vencord source code repository.
2. Navigate to the `src/plugins` directory.
3. Create a new folder for the plugin (e.g., `LainPet`).
4. Place the `index.tsx` file inside this newly created folder.
5. Open your terminal in the root Vencord directory and rebuild Vencord (by running `pnpm build`>`pnpm inject`>`choose stable`).
6. Completely restart Discord.
7. Go to **User Settings** > **Vencord** > **Plugins**.
8. Search for the plugin by its name and toggle it on to enable it.
9. Make sure to check out `/lain` for extra commands.
