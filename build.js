const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("node-html-parser");

const SITE_URL = "https://encapsulate.me";

function metadata(document, key, file) {
  const matches = document.querySelectorAll("head meta").filter(meta =>
    (meta.getAttribute("property") || meta.getAttribute("name")) === key
  );
  const value = matches[0]?.getAttribute("content")?.trim();
  if (matches.length !== 1 || !value) {
    throw new Error(`${file}: expected exactly one nonempty ${key} meta tag`);
  }
  return value;
}

function collectPosts(root = __dirname) {
  const files = fs.readdirSync(path.join(root, "writing"), { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
    .map(entry => `writing/${entry.name}`);
  // This interactive article lives outside the writing directory.
  if (fs.existsSync(path.join(root, "why.html"))) files.push("why.html");

  const posts = files.map(file => {
    const document = parse(fs.readFileSync(path.join(root, file), "utf8"));
    const title = metadata(document, "og:title", file);
    const description = metadata(document, "og:description", file);
    const published = metadata(document, "article:published_time", file);
    const date = new Date(`${published}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(published) ||
        Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== published) {
      throw new Error(`${file}: article:published_time must be a valid YYYY-MM-DD date`);
    }
    return { title, description, published, date, url: `${SITE_URL}/${file.replace(/\.html$/, "")}` };
  });
  if (!posts.length) throw new Error("No articles found; refusing to replace the feed with an empty one");
  return posts.sort((a, b) => b.date - a.date || a.url.localeCompare(b.url, "en", { numeric: true }));
}

function escapeXml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
  })[character]);
}

function renderFeed(posts) {
  const items = posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Encapsulate.me -- Justin Higgins</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Ideas, systems and fun writings of Justin Higgins</description>
    <language>en-us</language>
    <pubDate>${posts[0].date.toUTCString()}</pubDate>
    <image>
      <url>${SITE_URL}/assets/avatar.jpg</url>
      <title>Encapsulate.me -- Justin Higgins</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>
`;
}

function build(root = __dirname, check = false) {
  const posts = collectPosts(root);
  const xml = renderFeed(posts);
  const output = path.join(root, "rss.xml");
  if (check) {
    if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== xml) {
      throw new Error("rss.xml is out of date; run npm run build");
    }
  } else {
    fs.writeFileSync(output, xml);
  }
  return posts.length;
}

if (require.main === module) {
  try {
    const check = process.argv.includes("--check");
    console.log(`${check ? "Checked" : "Built"} RSS feed with ${build(__dirname, check)} articles.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { build, collectPosts, renderFeed };
