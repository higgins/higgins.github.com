const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { parse } = require("node-html-parser");
const { build, collectPosts, renderFeed } = require("../build");
const root = path.join(__dirname, "..");

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "site-feed-"));
  fs.mkdirSync(path.join(directory, "writing"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function article(date, title = "A &amp; B &quot;quoted&quot;", description = "A &lt; B's example") {
  return `<html><head>
    <meta content="${title}" property="og:title">
    <meta name="og:description" content="${description}">
    <meta property="article:published_time" content="${date}">
  </head><body>Article</body></html>`;
}

test("feed dates and order come from metadata, regardless of filesystem dates", t => {
  const directory = fixture(t);
  fs.writeFileSync(path.join(directory, "writing/new.html"), article("2025-12-31"));
  fs.writeFileSync(path.join(directory, "writing/old.html"), article("2020-02-29"));
  fs.writeFileSync(path.join(directory, "writing/notes.md"), "not an article");
  const before = renderFeed(collectPosts(directory));
  const posts = collectPosts(directory);
  assert.deepEqual(posts.map(post => post.published), ["2025-12-31", "2020-02-29"]);
  fs.utimesSync(path.join(directory, "writing/old.html"), new Date(), new Date("2030-01-01"));
  assert.equal(renderFeed(collectPosts(directory)), before);
  assert.equal(posts[0].title, 'A & B "quoted"');
  assert.match(before, /A &amp; B &quot;quoted&quot;/);
  assert.match(before, /A &lt; B&apos;s example/);
});

test("invalid or missing metadata fails before overwriting the existing feed", t => {
  const directory = fixture(t);
  const file = path.join(directory, "writing/invalid.html");
  fs.writeFileSync(path.join(directory, "rss.xml"), "previous feed");
  for (const content of [article("2025-02-30"), article("bad-date"), article("2025-01-01", ""),
    article("2025-01-01").replace(/<meta name="og:description"[^>]*>/, "")]) {
    fs.writeFileSync(file, content);
    assert.throws(() => build(directory), /invalid.html/);
    assert.equal(fs.readFileSync(path.join(directory, "rss.xml"), "utf8"), "previous feed");
  }
});

test("check mode detects stale output and repeated builds are identical", t => {
  const directory = fixture(t);
  const file = path.join(directory, "writing/new.html");
  fs.writeFileSync(file, article("2025-01-01"));
  assert.throws(() => build(directory, true), /out of date/);
  build(directory);
  const output = fs.readFileSync(path.join(directory, "rss.xml"), "utf8");
  assert.equal(build(directory, true), 1);
  build(directory);
  assert.equal(fs.readFileSync(path.join(directory, "rss.xml"), "utf8"), output);
  fs.writeFileSync(file, article("2025-01-01", "Changed title"));
  assert.throws(() => build(directory, true), /out of date/);
});

test("the site feed keeps legacy IDs, includes recent posts, and agrees with the home index", () => {
  const posts = collectPosts(root);
  const byUrl = new Map(posts.map(post => [post.url, post]));
  const feed = renderFeed(posts);
  for (const route of ["writing/2023", "why", "writing/e25n", "writing/2024", "writing/2025"]) {
    const url = `https://encapsulate.me/${route}`;
    assert.ok(byUrl.has(url), route);
    assert.ok(feed.includes(`<guid isPermaLink="true">${url}</guid>`));
  }
  const home = parse(fs.readFileSync(path.join(root, "index.html"), "utf8"));
  for (const entry of home.querySelectorAll("li")) {
    const date = entry.querySelector(".publishedAt")?.text;
    if (!date) continue;
    const href = entry.querySelector("a").getAttribute("href");
    assert.equal(byUrl.get(`https://encapsulate.me${href}`)?.published, date, href);
  }
});

test("site pages have unique titles, matching share metadata, and existing preview images", () => {
  const files = ["", "writing"].flatMap(directory =>
    fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith(".html"))
      .map(file => path.join(directory, file))
  );
  const titles = new Set();
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    if (!source.includes('class="site-page"')) continue;
    const doc = parse(source);
    const title = doc.querySelector("title").text;
    assert.ok(!titles.has(title), `${file}: duplicate title`);
    titles.add(title);
    const meta = key => {
      const matches = doc.querySelectorAll("head meta").filter(tag =>
        (tag.getAttribute("property") || tag.getAttribute("name")) === key);
      assert.equal(matches.length, 1, `${file}: ${key}`);
      return matches[0].getAttribute("content");
    };
    assert.equal(meta("og:title"), title);
    assert.equal(meta("twitter:title"), title);
    assert.equal(meta("description"), meta("og:description"));
    assert.equal(meta("description"), meta("twitter:description"));
    const url = `https://encapsulate.me/${file === "index.html" ? "" : file.replace(/\.html$/, "")}`;
    assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute("href"), url);
    assert.equal(meta("og:url"), url);
    assert.equal(doc.querySelector('link[type="application/rss+xml"]').getAttribute("href"), "/rss.xml");
    for (const key of ["og:image", "twitter:image"]) {
      const image = new URL(meta(key));
      assert.equal(image.origin, "https://encapsulate.me");
      assert.ok(fs.existsSync(path.join(root, image.pathname)), `${file}: missing ${image.pathname}`);
    }
  }
});
