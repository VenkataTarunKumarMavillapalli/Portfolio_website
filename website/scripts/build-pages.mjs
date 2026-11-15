import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const basePath = "/Portfolio_website";
const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
});
if (build.status !== 0) process.exit(build.status || 1);
writeFileSync(new URL("../out/.nojekyll", import.meta.url), "");
writeFileSync(new URL("../out/.base-path", import.meta.url), basePath);

// Preserve incoming links to the previous portfolio's HTML pages.
const redirects = {
  "about.html": "journey/",
  "experience.html": "journey/",
  "projects.html": "work/",
  "indivProject.html": "work/",
  "achievements.html": "learning/",
  "contact.html": "contact/",
};
for (const [file, target] of Object.entries(redirects)) {
  const destination = `${basePath}/${target}`;
  writeFileSync(new URL(`../out/${file}`, import.meta.url), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Venkata Tarun — Page moved</title><meta http-equiv="refresh" content="0;url=${destination}"><link rel="canonical" href="https://venkatatarunkumarmavillapalli.github.io${destination}"></head><body><h1>This page has moved.</h1><p><a href="${destination}">Continue to the new portfolio</a></p></body></html>\n`);
}
