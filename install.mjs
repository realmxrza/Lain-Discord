#!/usr/bin/env node

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_SOURCE = path.join(ROOT, "LainPet");
const SNIPPET_SOURCE = path.join(ROOT, "snippet.ts");
const DEFAULT_SNIPPET_OUTPUT = path.resolve(process.cwd(), "lainpet-snippet.js");
const ESBUILD_VERSION = "0.28.1";

function printUsage() {
  console.log(`Lain installer

Usage:
  node install.mjs vencord [options]
  node install.mjs snippet [options]
  node install.mjs help

Vencord options:
  --vencord-dir PATH  Vencord source directory
  --no-build          Copy the plugin without running the Vencord build
  --dry-run           Show actions without changing files

Snippet options:
  --output PATH       Output JavaScript file
  --vencord-dir PATH  Use the Vencord esbuild installation when available
  --dry-run           Show actions without changing files

Environment:
  VENCORD_DIR         Vencord source directory used when --vencord-dir is absent
`);
}

function parseArguments(argumentsList) {
  const [command = "help", ...rest] = argumentsList;
  const options = {
    command,
    dryRun: false,
    noBuild: false,
    output: DEFAULT_SNIPPET_OUTPUT,
    vencordDir: null,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--no-build") {
      options.noBuild = true;
      continue;
    }

    if (argument === "--output" || argument === "--vencord-dir") {
      const value = rest[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a path.`);
      }

      if (argument === "--output") options.output = path.resolve(value);
      else options.vencordDir = path.resolve(value);
      index += 1;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.command = "help";
      continue;
    }

    throw new Error(`Unknown option: ${argument}`);
  }

  return options;
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isVencordDirectory(directory) {
  const sourceDirectory = path.join(directory, "src");
  const packageFile = path.join(directory, "package.json");

  if (!(await pathExists(sourceDirectory)) || !(await pathExists(packageFile))) {
    return false;
  }

  try {
    const packageData = JSON.parse(await readFile(packageFile, "utf8"));
    return packageData.name === "vencord";
  } catch {
    return false;
  }
}

async function findVencordDirectory(explicitDirectory) {
  const candidates = [
    explicitDirectory,
    process.env.VENCORD_DIR,
    path.join(process.cwd(), "Vencord"),
    path.join(os.homedir(), "Vencord"),
    path.join(os.homedir(), "Documents", "Vencord"),
    path.join(os.homedir(), ".local", "share", "Vencord"),
    path.join(os.homedir(), "Library", "Application Support", "Vencord"),
  ].filter(Boolean);
  const checked = new Set();

  for (const candidate of candidates) {
    const directory = path.resolve(candidate);
    if (checked.has(directory)) continue;
    checked.add(directory);

    if (await isVencordDirectory(directory)) return directory;
  }

  throw new Error(
    "Vencord source was not found. Use --vencord-dir PATH or set VENCORD_DIR.",
  );
}

function runCommand(command, argumentsList, options) {
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.error?.code === "ENOENT") return null;
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? "unknown"}.`);
  }

  return result.status;
}

function runVencordBuild(directory) {
  const commands =
    process.platform === "win32"
      ? [
          ["pnpm.cmd", ["build"]],
          ["corepack.cmd", ["pnpm", "build"]],
        ]
      : [
          ["pnpm", ["build"]],
          ["corepack", ["pnpm", "build"]],
        ];

  for (const [command, argumentsList] of commands) {
    const result = runCommand(command, argumentsList, { cwd: directory });
    if (result !== null) return;
  }

  throw new Error("pnpm was not found. Install pnpm or enable Corepack.");
}

function findEsbuild(vencordDirectory) {
  const binaryName = process.platform === "win32" ? "esbuild.cmd" : "esbuild";
  const candidates = [
    process.env.ESBUILD_BIN,
    vencordDirectory && path.join(vencordDirectory, "node_modules", ".bin", binaryName),
    path.join(ROOT, "node_modules", ".bin", binaryName),
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function runEsbuild(argumentsList, vencordDirectory) {
  const localBinary = findEsbuild(vencordDirectory);
  if (localBinary) {
    runCommand(localBinary, argumentsList, { cwd: ROOT });
    return;
  }

  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = runCommand(
    npx,
    ["--yes", `esbuild@${ESBUILD_VERSION}`, ...argumentsList],
    { cwd: ROOT },
  );

  if (result === null) {
    throw new Error(
      "esbuild was not found. Install Node.js and npm, or pass --vencord-dir PATH.",
    );
  }
}

async function installVencord(options) {
  const directory = await findVencordDirectory(options.vencordDir);
  const destination = path.join(directory, "src", "userplugins", "LainPet");

  console.log(`Vencord source: ${directory}`);
  console.log(`Plugin target:  ${destination}`);

  if (!options.dryRun) {
    await mkdir(path.dirname(destination), { recursive: true });
    await rm(destination, { recursive: true, force: true });
    await cp(PLUGIN_SOURCE, destination, { recursive: true });
  }

  if (options.noBuild) {
    console.log(
      options.dryRun
        ? "Dry run: plugin copy and build skipped."
        : "Plugin copied. Vencord build skipped.",
    );
    return;
  }

  if (options.dryRun) {
    console.log("Dry run: Vencord build skipped.");
    return;
  }

  console.log("Building Vencord.");
  runVencordBuild(directory);
  console.log(`Build complete: ${path.join(directory, "dist")}`);
}

async function buildSnippet(options) {
  const output = path.resolve(options.output);
  const argumentsList = [
    SNIPPET_SOURCE,
    "--bundle",
    "--format=iife",
    "--platform=browser",
    "--target=es2020",
    "--outfile=" + output,
    "--legal-comments=none",
  ];

  console.log(`Snippet output: ${output}`);

  if (options.dryRun) {
    console.log("Dry run: snippet build skipped.");
    return;
  }

  await mkdir(path.dirname(output), { recursive: true });
  runEsbuild(argumentsList, options.vencordDir);
  console.log("Snippet build complete.");
  console.log(`Add this tag to a page: <script src="/${path.basename(output)}"></script>`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.command === "help") {
    printUsage();
    return;
  }

  if (options.command === "vencord") {
    await installVencord(options);
    return;
  }

  if (options.command === "snippet") {
    await buildSnippet(options);
    return;
  }

  throw new Error(`Unknown command: ${options.command}`);
}

main().catch((error) => {
  console.error(`Installer error: ${error.message}`);
  process.exitCode = 1;
});
