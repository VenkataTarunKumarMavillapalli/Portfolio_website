import http from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const port = Number(process.env.PREVIEW_PORT || 4177);
const basePath = await readFile(path.join(root, ".base-path"), "utf8").catch(() => "");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2" };
const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
  let file;
  try {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (basePath && pathname === "/") { response.writeHead(302, { Location: `${basePath}/` }); response.end(); return; }
    if (basePath) {
      if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) throw new Error("Outside base path");
      pathname = pathname.slice(basePath.length) || "/";
    }
    file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error("Invalid path");
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith("/")) { response.writeHead(308, { Location: `${basePath}${pathname}/` }); response.end(); return; }
      file = path.join(file, "index.html"); info = await stat(file);
    }
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Content-Length": info.size, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" });
  } catch {
    file = path.join(root, "404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  }
  if (request.method === "HEAD") { response.end(); return; }
  createReadStream(file).on("error", () => response.end("Build the website with npm run build first.")).pipe(response);
});
server.on("error", error => { console.error(`Preview could not start: ${error.message}`); process.exit(1); });
server.listen(port, "127.0.0.1", () => console.log(`Local website preview: http://127.0.0.1:${port}${basePath}/\nPress Ctrl+C to stop.`));
