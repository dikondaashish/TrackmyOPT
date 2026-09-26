# Resume template preview assets

The selection cards serve pre-generated WebP thumbnails. Quick Preview downloads
an accompanying static PDF and loads PDF.js only after the modal is opened.
Both assets contain only the fictional sample content in `templates/latex`.

After changing a template, from `apps/web` run:

```sh
pnpm previews:generate
pnpm previews:check
```

Generation requires `pdflatex` (TeX Live with the packages used by the templates)
and `pdftoppm` (Poppler) on PATH. It uses the existing Sharp dependency to encode
960-pixel-wide WebP thumbnails. No remote compiler or credentials are needed.
Commit the changed `.tex` files, generated JSON manifest, and new files under
`public/template-previews` together. Old versioned assets may remain available
for cached pages. The build checks source freshness and asset content hashes;
it does not compile LaTeX or require TeX Live/Poppler on the deployment server.

URLs contain content hashes and receive one-year immutable cache headers.
Personalized resume generation continues to use the normal compiler service.
