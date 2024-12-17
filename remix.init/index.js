const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const toml = require("@iarna/toml");
const sort = require("sort-package-json");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main({ rootDirectory }) {
  const README_PATH = path.join(rootDirectory, "README.md");
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".dev.vars.example");
  const ENV_PATH = path.join(rootDirectory, ".dev.vars");
  const PACKAGE_JSON_PATH = path.join(rootDirectory, "package.json");
  const WRANGLER_TOML_PATH = path.join(rootDirectory, "wrangler.toml");

  const REPLACER = "remix-ginnan-stack";

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = (DIR_NAME + "-" + SUFFIX).replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();

  const [readme, env, packageJson, wranglerToml] = await Promise.all([
    fs.readFile(README_PATH, "utf-8"),
    fs.readFile(EXAMPLE_ENV_PATH, "utf-8"),
    fs.readFile(PACKAGE_JSON_PATH, "utf-8").then((s) => JSON.parse(s)),
    fs.readFile(WRANGLER_TOML_PATH, "utf-8").then((s) => toml.parse(s)),
  ]);

  const newReadme = readme.replace(new RegExp(escapeRegExp(REPLACER), "g"), APP_NAME);

  const newPackageJson = JSON.stringify(sort({ ...packageJson, name: APP_NAME }), null, 2) + "\n";

  wranglerToml.name = APP_NAME;
  const newWranglerToml = toml.stringify(wranglerToml);

  await Promise.all([
    fs.writeFile(README_PATH, newReadme),
    fs.writeFile(ENV_PATH, env),
    fs.writeFile(PACKAGE_JSON_PATH, newPackageJson),
    fs.writeFile(WRANGLER_TOML_PATH, newWranglerToml),
    fs
      .copyFile(path.join(rootDirectory, "remix.init", "gitignore"), path.join(rootDirectory, ".gitignore"))
      .catch(() => {}),
  ]);

  execSync(`pnpm install`, { stdio: "inherit", cwd: rootDirectory });

  console.log(
    `Setup is complete. You're now ready to rock and roll 🤘

Start development with \`pnpm dev\`
    `,
  );
}

module.exports = main;
