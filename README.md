# Teen Deen (Islamic Kids App)

Project is hosted on GitHub Pages under `/islamic-kids-app/`.

## Base Path
All asset and data paths are resolved using `assets/base-path.js`. Do not use root-relative paths (`/assets/...`). Prefer relative plus `withBase()` when building URLs in JS.

## Quizzes
- Shared quiz loader: `assets/quiz.js`
- Quiz data files: `data/quizzes/<lesson-id>.json`
- Index of lessons with quizzes: `data/quizzes/index.json`

Lesson pages include `quiz.js` and delegate rendering via `window.TeenDeenQuiz.initialize(lesson)`.

## Navigation
Nav tabs are standardized across all pages: Discover, Lessons, Parents, Progress. A toggle for Lessons vs Quiz mode is available on the Lessons page.

## Development
Use `?debug=1` to enable the debug overlay with base-path and asset status.
