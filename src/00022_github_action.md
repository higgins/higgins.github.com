# Show HN: This page was posted automatically from a commit

> tl;dr: This URL was posted to hackernews automatically from a github
> action I wrote:
> [action-hackernews-post](https://github.com/marketplace/actions/post-to-hackernews).

## Motivation
Earlier this year I started writing online regularly. I committed to a
pace of weekly updates on my creative
project—[24HourHomepage](https://24hourhomepage.com)—all posted on
[Medium](https://higgins.medium.com).

I recently migrated all my articles from Medium to this domain with
the hopes of having a "write once, publish many" sort of flow.

So I wrote [this github
action](https://github.com/marketplace/actions/post-to-hackernews) to
submit a URL and title to hackernews.

## Applications
* Announce new versions of your OSS project
* Publish part of your github pages blog

## Installation
When configuring your github actions workflow, add the package like so

```
uses: higgins/action-hackernews-post@v1.0.1
with:
  HN_USERNAME: ${{ secrets.HN_USERNAME }}
  HN_PASSWORD: ${{ secrets.HN_PASSWORD }}
  POST_TITLE: "An clock where every second is user submitted content"
  POST_URL: https://24HourHomepage.com
```

Be sure to set `HN_USERNAME` and `HN_PASSWORD` in github secrets or
via another secure method.

## Thank you
If you enjoyed this, let me know! [—justin](https://twitter.com/justinprojects)
