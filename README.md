# encapsulate.me

Run the local preview with Node.js:

```sh
npm run dev
```

Open http://127.0.0.1:8765. No dependency installation or build is needed.
Extensionless URLs such as `/projects` and `/writing/2025` work locally,
alongside directory-based apps such as `/matrix/`.
Refresh the browser after edits and press Ctrl+C to stop the server.

To use a different port, run `PORT=8000 npm run dev`.

The main site and writing pages share `assets/styles.css` and the header in
`templates/site-header.html`. After editing the header template, run
`npm run layout` to update the HTML files, then commit those files with the template.
Run `npm run check:layout` to check for header drift without changing files.

To add a page using this layout, copy an existing site page, keeping its
`site-page` body class, shared stylesheet link, and `site-header` comment markers.
Pages remain ordinary HTML and work without client-side JavaScript or a build.
Standalone experiments and the older resume page retain their own layouts.

## Publishing writing

Article titles, descriptions, share images, and dates live in each HTML page's
`<head>`. Keep the page title, `description`, Open Graph, and Twitter metadata in
sync. Use an extensionless HTTPS URL for `canonical` and `og:url`.

Every `writing/*.html` article, plus `/why`, is included in RSS. Set
`<meta property="article:published_time" content="YYYY-MM-DD" />` to its publication
date and keep that date stable when editing. Dates already listed on the home
page are preserved. Older imported 24HourHomepage posts use the date they were
added to this site, October 19, 2021; their original Medium dates are not recorded
here. Other older articles use their first addition in Git history.

After adding or editing an article:

```sh
npm ci
npm run build
npm run check:feed
npm run check:layout
npm test
```

Commit the generated `rss.xml` alongside the article. The feed uses explicit
dates and stable extensionless IDs; rebuilding or cloning the repo does not
change publication dates. The build only writes the local RSS file.

The `/now` date should reflect a personal update, not a styling change. The
linked PDF is the July 2025 CV and predates the current Director role; `/work`
is explicitly archived. Refresh the CV when its content is ready. Project
descriptions still need a less résumé-like editorial pass.
