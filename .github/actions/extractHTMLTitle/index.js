const core = require('@actions/core');
const github = require('@actions/github');
const { parse } = require("node-html-parser");
const https = require('https');

const { INPUT_ADDED_FILE_PATH } = process.env;

const getHTML = (PATH) => {
  return new Promise((resolve, reject) => {
    let html = '';

    const options = {
      host: 'raw.githubusercontent.com',
      port: 443,
      path: PATH,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        resolve(html);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};


// NOTE: this only works on public repos as it assumes you're using a
// public repo. If you want this to work for private repos, use the
// octokit suite of tools to fetch file contents
async function run() {
  const REPO_OWNER = github.context.payload.repository.owner.name;
  const REPO_NAME = github.context.payload.repository.name;
  const PATH = `/${REPO_OWNER}/${REPO_NAME}/master/${INPUT_ADDED_FILE_PATH}`;
  const HTML = await getHTML(PATH);
  const parsed = parse(HTML);
  const title = parsed.getElementsByTagName("title")[0].innerHTML;
  const shouldPostToHN = parsed.getElementsByTagName("meta").find(h => h.rawAttrs.startsWith('name="shouldPostToHN"')).attributes.content;
  console.log({ title, shouldPostToHN });
  // NOTE: only output the title (and hence post to HN) if we marked this html for posting
  if (shouldPostToHN == "true") {
    core.setOutput('HTML_TITLE', title);
  }
}

run();
