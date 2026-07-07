# Agatha Schneider Portfolio

Personal portfolio for [htaschne.github.io](https://htaschne.github.io/).

The site presents selected projects, short technical notes, and experiments across full-stack development, distributed systems, algorithms, and interactive computing.

## Stack

- React
- TypeScript
- Vite
- React Router
- Markdown content with frontmatter
- KaTeX for math rendering

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npx tsc -b
npm run build
```

The production build emits a static site in `dist/` and copies `index.html` to `404.html` so GitHub Pages can serve client-side routes.
