# Client-side scripts

Project structure:
* `src` contains application code (ES6 / Preact)
* `css` contains stylesheets (PostCSS)

## Development

Start by installing [Node](https://nodejs.org/en/download/) if you don't have it yet,
then execute `npm install` to fetch dependencies (note that this may take a while).

Use `npm run watch` to recompile code and stylesheets on change.

Don't forget to rebuild dist assets before committing something new
(you can do it by running `npm run build`).

To have the site available in your browser,
run [an HTTP server](https://gist.github.com/willurd/5720255) in the parent directory, e.g.:

```bash
# If you have Python 3 installed
python -m http.server 8000
# Now head over to http://localhost:8000
```

