# Contributing to Trampolin Web

Thanks for taking the time to contribute! ❤️

## Getting Started

1. **Fork the repository** and clone your fork.
2. Run `npm install` and `npx husky install`.
3. Start the dev server with `npm run dev`.
4. (Optional) Use Docker stack: `docker compose up --build`.

## Branching Strategy

- **main** – stable, deployable at all times.
- **feat/<topic>** – new features.
- **fix/<bug>** – bug fixes.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(scope): <short summary>

<body>

<footer>
```

Example:

```
feat(auth): add OAuth2 login flow
```

## Code Style

- ESLint + Prettier enforce style automatically.
- Run `npm run lint` and `npm run format` before pushing.

## Pull Requests

1. Ensure CI passes.
2. Reference related issues in the description.
3. Keep PRs focused; open multiple PRs for unrelated changes.

## Issue Reporting

Use GitHub Issues. Provide:

- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Screenshots/logs** if applicable

## Security

Please email security@brightonanalytics.com for vulnerabilities instead of opening public issues.
