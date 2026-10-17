const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const check = process.argv.includes("--check");
const template = fs.readFileSync(path.join(root, "templates/site-header.html"), "utf8").trimEnd();
const header = `  <!-- site-header:start -->\n${template}\n  <!-- site-header:end -->`;
const region = /^ *<!-- site-header:start -->[\s\S]*?<!-- site-header:end -->/m;
const pages = ["", "writing"].flatMap(directory =>
  fs.readdirSync(path.join(root, directory))
    .filter(name => name.endsWith(".html"))
    .map(name => path.join(directory, name))
);
let count = 0;
let changed = 0;

for (const page of pages) {
  const file = path.join(root, page);
  const source = fs.readFileSync(file, "utf8");
  if (!/<body\b[^>]*class="[^"]*\bsite-page\b/.test(source)) continue;
  count++;
  if (!region.test(source)) {
    console.error(`${page}: missing site-header markers`);
    process.exitCode = 1;
    continue;
  }
  const result = source.replace(region, header);
  if (source !== result) {
    changed++;
    if (check) {
      console.error(`${page}: header differs from template; run npm run layout`);
      process.exitCode = 1;
    } else {
      fs.writeFileSync(file, result);
    }
  }
}

console.log(`${check ? "Checked" : "Synced"} ${count} page headers; ${changed} ${check ? "out of sync" : "updated"}.`);
