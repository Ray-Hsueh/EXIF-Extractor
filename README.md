## EXIF Extractor

A small tool that parses EXIF/GPS in your browser. Drag or select images to view camera, lens, time, ISO, aperture, shutter, focal length, and GPS. Nothing is uploaded.

### Features
- **Local parsing**: all processing happens in your browser.
- **Multilingual UI**: EN / 中文 / ES / FR / العربية / हिन्दी / اردو / 日本語.
- **Multiple input methods**:
  - Drag and drop multiple photos
  - File picker
  - Paste from clipboard
  - Analyze by URL (CORS required)
- **Export**: JSON, CSV, PDF report.
- **Viewing helpers**: expand/collapse all, copy summary, copy coordinates, remove card.
- **Hash/Signature**: compute MD5 and SHA‑256; try to detect digital signatures.
- **PWA**: installable and offline-capable (first load requires network to fetch deps).

### Usage
1. Open `index.html` (prefer running via a local static server; see below).
2. Drag images onto the page, or click to choose files.
3. You can also paste from clipboard, or enter an image URL and click "Analyze URL".
4. In results, expand cards, copy fields, open map, or export JSON/CSV/PDF.

### Privacy
- Photos are not uploaded; parsing is local.
- URL analysis requires the source to allow CORS.
- Offline: first load needs network; afterward can start offline on the same device (cross‑origin deps may come from browser cache).

### Supported formats
- Common: JPG, JPEG, PNG, HEIC, HEIF, AVIF, TIFF, TIF
- RAW: NEF, CR2, CR3, ARW, RAF, RW2, ORF, DNG

### Deployment
- Pure static site; deploy to any static host (Cloudflare Pages, Netlify, Vercel, Nginx, etc.).
- `manifest.webmanifest` and `sw.js` are designed for the domain root scope (`/`). If deploying under a subpath, adjust paths accordingly.

### Dependencies (via CDN)
- `exifr`, `exifreader` (EXIF/RAW parsing)
- `jspdf` (PDF export)
- `spark-md5` (MD5 hashing)
- `html2canvas` (render DOM to image for nicer PDF)

### License
- MIT License. See `LICENSE`. 