# encapsulate.me

## Publishing
1. All blog posts are written in markdown in the `writing/src/` dir.
2. Convert the markdown to html via:
```
grip src/MARKDOWN_FILE --export --no-inline PrettyURLFileName.html
```
3. Inject this into the new html:
```
  <meta property="og:title" content="" />
  <meta property="og:description" content="" />
  <meta property="og:image" content="https://encapsulate.me/images/" />
  <link href="/styles/grip-styles.css" rel="stylesheet" type="text/css"/>
  <link href="/styles/blog-styles.css" rel="stylesheet" type="text/css"/>
  <script src="/scripts/writing.js"></script>
```
4. Insert header logo into the body:
```
  <header>
    <div class="logo" style="cursor: pointer" onClick="author()">
      <div class="i"></div>
      <div class="w"></div>
      <div class="o"></div>
    </div>
  </header>
```
## To build RSS feed
```
node build.js
```
