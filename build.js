const RSS = require("rss");
const fs = require("fs");
const { parse } = require("node-html-parser");
const WRITING_DIR = __dirname + "/writing/";
let files = [];

fs.readdirSync(WRITING_DIR, { withFileTypes: true }).forEach(file => {
  if (!file.isFile()) { return } // exclude src markdown dir
  const date = fs.statSync(WRITING_DIR + file.name);
  files.push({ name: file.name, birthtime: date.birthtime.getTime() });
});

files.sort((a,b) => a.birthtime > b.birthtime ? -1 : 1);

const feed = new RSS({
  title: "Encapsulate.me -- Writings of Justin Higgins",
  description: "Writings and the work of Justin Higgins",
  feed_url: "https://encapsulate.me/rss.xml",
  site_url: "https://encapsulate.me",
  image_url: "https://encapsulate.me/face.gif",
  copyright: "∞ Justin Higgins",
  language: "en",
  categories: ["software development","fun-ternet","meme"],
  pubDate: files[0].birthtime,
  ttl: "60"
});

files.forEach(file => {
  const fileStr = fs.readFileSync(WRITING_DIR + file.name);
  const parsed = parse(fileStr);
  const ogTitle = parsed.getElementsByTagName("meta").find(h => h.rawAttrs.startsWith('property="og:title"'));
  const ogDescription = parsed.getElementsByTagName("meta").find(h => h.rawAttrs.startsWith('property="og:description"'));
  const ogImage = parsed.getElementsByTagName("meta").find(h => h.rawAttrs.startsWith('property="og:image"'));
  if (!ogTitle || !ogDescription || !ogImage) {
    return
    // TODO:
    // throw new Error(`File doesn't have have og:title, og:description, og:image. ${file.name}`);
  }
  const title = ogImage.rawAttrs.split('content=')[1].replace(/"/g, '');
  const description = ogImage.rawAttrs.split('content=')[1].replace(/"/g, '');
  const imageUrl = ogImage.rawAttrs.split('content=')[1].replace(/"/g, '');

  const contents = {
    name: file.name,
    title,
    description,
    imageUrl,
  };
  console.log(contents);
  feed.item({
    title,
    description,
    url: `https://encapsulate.me/writing/${file.name}`,
    categories: contents.categories,
    date: file.birthtime,
  });
});

// cache the xml to send to clients
const xml = feed.xml();
fs.writeFileSync(__dirname + '/rss.xml', xml);
console.log("Built new RSS feed.");
