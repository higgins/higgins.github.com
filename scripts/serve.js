const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8765);
const types = {
  "": "text/plain; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".org": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

function insideRoot(file) {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function fileStat(file) {
  try {
    if (!insideRoot(await fs.realpath(file))) return null;
    return await fs.stat(file);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    return response.end();
  }

  let url, pathname;
  try {
    url = new URL(request.url, "http://localhost");
    pathname = decodeURIComponent(url.pathname);
    if (pathname.includes("\0")) throw new Error("Invalid path");
  } catch {
    response.writeHead(400);
    return response.end();
  }

  try {
    let file = path.resolve(root, `.${pathname}`);
    if (!insideRoot(file) || pathname.split("/").some(part => part.startsWith("."))) {
      response.writeHead(404);
      return response.end();
    }

    let stats = await fileStat(file);
    if (stats?.isDirectory() && !(await fileStat(path.join(file, "index.html")))?.isFile()) {
      const page = `${file}.html`;
      const pageStats = await fileStat(page);
      if (pageStats?.isFile()) {
        file = page;
        stats = pageStats;
      }
    }
    if (!stats && !path.extname(file) && !pathname.endsWith("/")) {
      file += ".html";
      stats = await fileStat(file);
    }
    if (stats?.isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        return response.end();
      }
      file = path.join(file, "index.html");
      stats = await fileStat(file);
    }
    if (!stats?.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end(request.method === "HEAD" ? undefined : "Not found\n");
    }

    const body = request.method === "HEAD" ? undefined : await fs.readFile(file);
    response.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": stats.size,
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch (error) {
    console.error(error.message);
    response.writeHead(500);
    response.end();
  }
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be an integer between 1 and 65535.");
  process.exit(1);
}
server.on("error", error => {
  console.error(error.code === "EADDRINUSE" ? `Port ${port} is already in use. Stop the other server or set PORT.` : error.message);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${port} (Ctrl+C to stop)`);
});
