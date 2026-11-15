import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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
  "about.html": "about/",
  "experience.html": "work/",
  "projects.html": "work/",
  "indivProject.html": "work/",
  "achievements.html": "learning/",
  "contact.html": "contact/",
  "journey/index.html": "timeline/",
  "beyond/index.html": "about/#outside-work",
  "work/investigative-ai/index.html": "work/world-food-programme/",
  "work/oversight-analytics/index.html": "work/world-food-programme/",
  "work/request-workflow-automation/index.html": "work/world-food-programme/",
  "work/data-quality-at-efsa/index.html": "work/efsa/",
  "work/devops-date-updater/index.html": "work/efsa/",
  "work/crm-reconciliation/index.html": "work/efsa/",
  "work/apple-product-development/index.html": "learning/#apple-academy",
  "work/sauce-and-spoon/index.html": "work/",
  "work/bellabeat-analysis/index.html": "work/",
  "work/human-activity-recognition/index.html": "work/",
  "work/california-housing/index.html": "work/",
  "work/parallel-data-imputation/index.html": "work/",
};
for (const [file, target] of Object.entries(redirects)) {
  const destination = `${basePath}/${target}`;
  mkdirSync(new URL(`../out/${file.substring(0, file.lastIndexOf("/") + 1)}`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../out/${file}`, import.meta.url), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Venkata Tarun Kumar Mavillapalli — Page moved</title><meta http-equiv="refresh" content="0;url=${destination}"><link rel="canonical" href="https://venkatatarunkumarmavillapalli.github.io${destination}"></head><body><h1>This page has moved.</h1><p><a href="${destination}">Continue to the new portfolio</a></p></body></html>\n`);
}
