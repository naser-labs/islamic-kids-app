# Teen Deen

A privacy-first, static web app for teenagers to learn core Islamic concepts through short lessons and self-check quizzes.

**Live Site:** https://naser-labs.github.io/islamic-kids-app/

**Target audience:** Teens (ages 13–18)

## Quick Start

### Viewing the Site

Just visit the live link above! No installation needed.

### Adding or Editing Lessons

See [docs/LESSONS.md](docs/LESSONS.md) for detailed instructions on how to:
- Add new lessons
- Understand the data structure
- Test locally
- Debug issues

## Structure

- `index.html` — Home with featured lessons and progress tracking
- `parents.html` — Parent/guardian guide
- `lessons/index.html` — Lessons list with search
- `lessons/lesson.html` — Single lesson view with quiz and sharing
- `assets/styles.css` — Responsive design system
- `assets/base-path.js` — GitHub Pages base path resolver
- `assets/app.js` — Data loading, filtering, quiz logic, and sharing
- `assets/main.js` — UI interactions and filtering
- `assets/lessons.json` — Lessons metadata
- `docs/LESSONS.md` — **Complete lessons system documentation**
- `.github/workflows/deploy.yml` — GitHub Pages deployment via Actions
- `.nojekyll` — Disable Jekyll to serve assets

## Key Features

### Base Path Resolution (GitHub Pages Compatible)

The site correctly handles deployment under GitHub Pages subpaths using:
- `<meta name="site-base">` configuration
- Centralized `base-path.js` helper
- All URLs use `withBase()` function

**Debug mode**: Add `?debug=1` to any URL to see base path diagnostics.

### Responsive & Accessibility

- Mobile-first adjustments: aspect-ratio hero, stacked controls, no horizontal scroll
- Buttons: min-height 44px (tap targets)
- Typography: `clamp()` sizes for headings and body
- Safe-area padding with `env(safe-area-inset-*)`

### Sharing (static, privacy-safe)

- Desktop: Copy Results + Email Results
- Mobile: Copy Results + Email Results + Text Results (SMS)
- SMS link format decisions:
  - iOS (iPhone/iPad/iPod): `sms:&body=<encoded>` or `sms:+123...&body=<encoded>`
  - Android/others: `sms:?body=<encoded>` or `sms:+123...?body=<encoded>`
- Optional parent phone (localStorage key: `parentPhone`) used if present

## Deploy (GitHub Pages)

Project Pages URL: `https://naser-labs.github.io/islamic-kids-app/`

This repo uses a GitHub Actions workflow to deploy the static site to Pages from the `main` branch.

### One-time setup

1. Ensure repository name is `islamic-kids-app`
2. Enable GitHub Pages in Settings → Pages → Source: GitHub Actions

### Push updates

```bash
# From the project root
git add .
git commit -m "Update lessons or fix issue"
git push origin main
```

The workflow will publish the site automatically within ~2 minutes.

## Local Testing

### Option 1: Python HTTP Server

```bash
# From project root
python -m http.server 8080
# Then open http://localhost:8080/
```

### Option 2: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Node.js

```bash
npm install -g serve
serve .
```

**Important**: Always test navigation between pages to ensure base path logic works correctly.

## PWA & Offline

- Installable via the browser's "Add to Home Screen" prompt (manifest + icons provided)
- Offline-first caching of core pages and assets via `sw.js`
- Safe updates with versioned cache: update `CACHE_VERSION` in `sw.js` to bust old caches
- Friendly offline messages are shown when the network is unavailable

### Files

- `manifest.webmanifest` — app metadata, icons, theme colors
- `sw.js` — service worker: caches pages/assets, updates cache on new fetches, serves offline fallback
- `assets/icon.svg`, `assets/icon-maskable.svg` — icons for install

### Share options

- Copy Results — works everywhere
- Email Results — mailto link with prefilled subject/body
- Text Results — `sms:` deep link (iOS vs Android formats), optional parent/guardian phone from `localStorage`
- Web Share — shown when `navigator.share` is available, falls back to Copy

### Local-only progress

- `localStorage`: `lastLessonId`, `completedLessons` (array), `lessonScores` (map)
- Home shows a "Progress" card: "X lessons completed"

## Validation workflow

Pull requests to `main` run `scripts/validate.js` to:

- Check `assets/lessons.json` schema (id, number, title, minutes, tags)
- Check that internal links exist within the repo (ignores external links)

```bash
# Manually run validation locally
node scripts/validate.js
```

## Troubleshooting

### Lessons Don't Load

1. Check browser console for errors
2. Add `?debug=1` to URL for diagnostics
3. Verify `assets/lessons.json` exists and is valid JSON
4. Check that base path is configured correctly in HTML meta tags

### Navigation Broken on GitHub Pages

1. Ensure all HTML files have `<meta name="site-base" content="/islamic-kids-app">`
2. Verify `assets/base-path.js` is loaded first
3. Check that all internal links use `withBase()` helper

### Service Worker Not Updating

1. Increment `CACHE_VERSION` in `sw.js`
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear site data in browser DevTools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (add lessons, fix bugs, etc.)
4. Test locally using one of the methods above
5. Ensure validation passes: `node scripts/validate.js`
6. Submit a pull request

## Documentation

- [Lessons System Guide](docs/LESSONS.md) - Complete guide to how lessons work
- [Completion Summary](COMPLETION_SUMMARY.md) - Development history
- [Documentation Index](DOCUMENTATION_INDEX.md) - All project docs

## License

This project is open source for educational purposes.
