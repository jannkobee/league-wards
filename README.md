# League Wards

A Vue 3 and Vite project for viewing League of Legends player ranks and match history.

**Live demo:** [League Wards](https://leaguewards.netlify.app/)

## Tech stack

- Vue 3, TypeScript, and Vite
- PrimeVue
- Netlify Functions
- Riot Games API

## Development

```sh
npm install
npm run dev
```

Choose the API mode with `VITE_API_MODE`:

- `netlify` (recommended for deployments): set `VITE_API_MODE=netlify` and configure `RIOT_API_KEY` in Netlify environment variables. The Riot key stays server-side.
- `direct` (local development only): set `VITE_API_MODE=direct` and `VITE_API_KEY=your-riot-key` in `.env`. Vite exposes `VITE_*` values to the browser, so never use this mode for a public deployment.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and create a production build
- `npm run lint` — lint and automatically fix files

## Features

- Player search by Riot ID
- Current rank and LP
- Recent match history with match details
