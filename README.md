# Receptsamling Grupp 7 JavaScript 3 projekt

Node & NPM versions:

- Node: 24.15.0
- npm: 11.12.1

Strapi login information:

- email: test@test.com
- password: Admin123

## Tekniska val

- React + Vite
- Strapi
- CSS

### Starta projektet

Vite:

```bash
cd frontend
npm install
npm run dev
enter `http://localhost:5173`
```

Strapi:

```bash
cd backend
npm install
npm run develop
enter `http://localhost:1337`
```

## Routes

| Path            | Description         |
| --------------- | ------------------- |
| `/`             | Start page          |
| `/login`        | Log in              |
| `/register`     | Register            |
| `/create`       | Create a new recipe |
| `/admin`        | Admin panel         |
| `/recipe/:slug` | Recipe page         |

## Projekt struktur

```
frontend/
  src/
    components/
    context/
    css/
    pages/
    partials/
    services/
    utils/

backend/
  src/
    api/
```

## Starta tester

```bash
npx vitest
```
