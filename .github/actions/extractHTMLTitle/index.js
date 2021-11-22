const github = require('@actions/github');
const { parse } = require("node-html-parser");

const {
  INPUT_REPO_TOKEN,
  INPUT_ADDED_FILE_PATH
} = process.env;

console.log('--------------------------');
console.log({
  INPUT_REPO_TOKEN,
  INPUT_ADDED_FILE_PATH
});

async function run() {
  const octokit = github.getOctokit(INPUT_REPO_TOKEN)

  // You can also pass in additional options as a second parameter to getOctokit
  // const octokit = github.getOctokit(myToken, {userAgent: "MyActionVersion1"});

  const content = octokit.rest.repos.getContent({
    owner: github.context.payload.repository.owner.name,
    repo: github.context.payload.repository.name,
    path: INPUT_ADDED_FILE_PATH
  });
  console.log('CONTENT----------------');
  console.log(content);
}

run();
