import { readdir, readFile, writeFile, mkdir, copyFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../", import.meta.url));
const repository = path.resolve(source, "..");
if (path.basename(source) !== "website") throw new Error("Run this from the repository's website/ source directory.");
await stat(path.join(repository, ".git"));
const output = path.join(source, "out");
if ((await readFile(path.join(output, ".base-path"), "utf8")) !== "/Portfolio_website") {
  throw new Error("Run npm run build:pages first.");
}
const manifestPath = path.join(repository, ".pages-manifest.json");
const previous = JSON.parse(await readFile(manifestPath, "utf8"));
const allowed = file => typeof file === "string" && !path.isAbsolute(file) && !file.split(/[\\/]/).includes("..") && !["website", "always-becoming", "assets", ".git"].includes(file.split("/")[0]);
async function walk(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), relative));
    else if (entry.isFile() && entry.name !== ".base-path") files.push(relative);
  }
  return files;
}
const current = await walk(output);
if (![...previous, ...current].every(allowed)) throw new Error("Unsafe file in deployment manifest.");
for (const file of previous.filter(file => !current.includes(file))) {
  await unlink(path.join(repository, file)).catch(error => { if (error.code !== "ENOENT") throw error; });
}
for (const file of current) {
  const target = path.join(repository, file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(output, file), target);
}
await writeFile(manifestPath, JSON.stringify(current.sort(), null, 2) + "\n");
console.log(`Prepared ${current.length} static files. Review, commit, and push to main to publish.`);
