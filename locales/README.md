# Locales

- Each filename should correspond to a language code in `SUPPORTED_LANGS`, such as `en.json` and `zh-Hant.json`.
- The structure is a single-layer key-value; if you want to add a string, please update all locales.
- Steps to add a new language:
  1. Create `locales/<lang>.json`
  2. Add the corresponding code to the `SUPPORTED_LANGS` array in `app.js`
  3. Update the `CORE_ASSETS` list in `sw.js` and increment the `CACHE_NAME` version to allow PWA to pre-cache the new locale file
