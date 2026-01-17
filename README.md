# Islamic Kids App

A playful, static site for kids to learn about Islam with short lessons, gentle quizzes, and privacy-safe sharing.

## Structure

- `index.html` — Home with storefront hero and featured lessons
- `parents.html` — Parent guide and optional phone storage (local-only)
- `lessons/index.html` — Lessons list with search
- `lessons/lesson.html` — Single lesson view with quiz and share
- `assets/styles.css` — Responsive storefront design system
- `assets/app.js` — Data loading, filtering, quiz, and sharing logic
- `assets/lessons.json` — Lessons metadata
- `.github/workflows/deploy.yml` — GitHub Pages deployment via Actions
- `.nojekyll` — Disable Jekyll to serve assets

## Responsive & Accessibility

- Mobile-first adjustments: aspect-ratio hero, stacked controls, no horizontal scroll
- Buttons: min-height 44px (tap targets)
- Typography: `clamp()` sizes for headings and body
- Safe-area padding with `env(safe-area-inset-*)`

## Sharing (static, privacy-safe)

- Desktop: Copy Results + Email Results
- Mobile: Copy Results + Email Results + Text Results (SMS)
- SMS link format decisions:
  - iOS (iPhone/iPad/iPod): `sms:&body=<encoded>` or `sms:+123...&body=<encoded>`
  - Android/others: `sms:?body=<encoded)` or `sms:+123...?body=<encoded>`
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
git commit -m "Update responsive layout and SMS sharing"
git push origin main
```

The workflow will publish the site automatically.

## Local preview

Open `index.html` directly in your browser, or use a simple static server.

```bash
# Optional: using PowerShell
# Start a simple static server (Python required)
python -m http.server 8080
# Then open http://localhost:8080/index.html
```
