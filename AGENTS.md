# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

GERLED 3D Ceiling Previewer — a client-side Next.js 13 (Pages Router) app that lets users upload a ceiling photo and an overlay design, then composites a preview using HTML5 Canvas. No backend, database, or external API. The UI is in Turkish.

### Running the app

```
npm run dev   # starts Next.js dev server on http://localhost:3000
npm run build # production build
```

### Important notes

- The `@/` path alias is configured via `jsconfig.json` (maps to project root). Without this file the dev server will fail with module-not-found errors.
- No test framework is included; there are no automated tests to run.
- No linter (ESLint) is configured in the project.
- No environment variables or secrets are required.
